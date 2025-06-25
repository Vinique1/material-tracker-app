const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const ExcelJS = require("exceljs");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Best practice: Initialize Admin SDK only once to avoid deployment timeouts.
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

// Helper function to download an image from a URL
const getImageBuffer = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary");
  } catch (error) {
    logger.error(`Failed to fetch image at URL: ${url}`, error.message);
    return null;
  }
};

// DEFINITIVE FIX v3: This function now correctly translates your JSON styles,
// especially the border properties, to the format ExcelJS expects.
const translateStyle = (styleFromJSON) => {
    const exceljsStyle = {};
    if (styleFromJSON.font) {
        let fontColor = 'FF000000'; // Default to black
        const colorVal = styleFromJSON.font.color;
        if (colorVal && typeof colorVal === 'string' && !colorVal.includes("Values must be of type")) {
            fontColor = colorVal.startsWith('FF') ? colorVal : `FF${colorVal.replace("#", "")}`;
        }
        exceljsStyle.font = {
            name: styleFromJSON.font.name || 'Calibri',
            size: styleFromJSON.font.size || 11,
            bold: styleFromJSON.font.bold || false,
            italic: styleFromJSON.font.italic || false,
            color: { argb: fontColor },
        };
    }
    if (styleFromJSON.alignment) {
        exceljsStyle.alignment = {
            horizontal: styleFromJSON.alignment.horizontal || 'left',
            vertical: styleFromJSON.alignment.vertical || 'top',
            wrapText: styleFromJSON.alignment.wrap_text || false,
        };
    }
    if (styleFromJSON.border) {
        const border = {};
        // This block now correctly handles the string format from your JSON
        if (styleFromJSON.border.left) border.left = { style: styleFromJSON.border.left };
        if (styleFromJSON.border.right) border.right = { style: styleFromJSON.border.right };
        if (styleFromJSON.border.top) border.top = { style: styleFromJSON.border.top };
        if (styleFromJSON.border.bottom) border.bottom = { style: styleFromJSON.border.bottom };
        exceljsStyle.border = border;
    }
    if (styleFromJSON.fill && styleFromJSON.fill.pattern === 'solid') {
        let fillColor = 'FFFFFFFF'; // Default to white
        const colorVal = styleFromJSON.fill.color;
        if (colorVal && typeof colorVal === 'string' && !colorVal.includes("Values must be of type")) {
             fillColor = colorVal.startsWith('FF') ? colorVal : `FF${colorVal.replace("#", "")}`;
        }
        exceljsStyle.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColor }
        };
    }
    if(styleFromJSON.number_format) {
        exceljsStyle.numFmt = styleFromJSON.number_format;
    }
    return exceljsStyle;
};


exports.getReportPreviewData = onCall({ timeoutSeconds: 120 }, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "You must be logged in.");
    const { reportDate } = request.data;
    if (!reportDate) throw new HttpsError("invalid-argument", "A report date must be provided.");
    try {
        const startOfDay = new Date(`${reportDate}T00:00:00Z`);
        const endOfDay = new Date(`${reportDate}T23:59:59Z`);
        const deliveryLogsPromise = db.collection("delivery_logs").where("date", ">=", startOfDay).where("date", "<=", endOfDay).get();
        const issuanceLogsPromise = db.collection("issuance_logs").where("date", ">=", startOfDay).where("date", "<=", endOfDay).get();
        const [deliverySnapshot, issuanceSnapshot] = await Promise.all([deliveryLogsPromise, issuanceLogsPromise]);
        const allLogs = [
            ...deliverySnapshot.docs.map(doc => ({...doc.data(), type: 'DELIVERED'})),
            ...issuanceSnapshot.docs.map(doc => ({...doc.data(), type: 'ISSUED'}))
        ];
        if (allLogs.length === 0) return { reportData: [] };
        return { 
            reportData: allLogs.map((log, index) => ({
                sn: index + 1,
                description: log.materialDescription,
                qty: log.quantity,
                type: log.type,
                remarks: log.remarks || "N/A",
            }))
        };
    } catch (error) {
        logger.error("Preview data fetch failed:", error);
        throw new HttpsError("internal", "Failed to fetch preview data.");
    }
});

exports.generateInspectionReport = onCall({ timeoutSeconds: 300 }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "You must be logged in.");
  
  try {
    const { reportDate } = request.data;
    if (!reportDate) throw new HttpsError("invalid-argument", "A report date must be provided.");
    
    const templatePath = path.join(__dirname, "output.json");
    const styleTemplate = JSON.parse(fs.readFileSync(templatePath, "utf8"));

    const startOfDay = new Date(`${reportDate}T00:00:00Z`);
    const endOfDay = new Date(`${reportDate}T23:59:59Z`);
    const deliveryLogsPromise = db.collection("delivery_logs").where("date", ">=", startOfDay).where("date", "<=", endOfDay).get();
    const issuanceLogsPromise = db.collection("issuance_logs").where("date", ">=", startOfDay).where("date", "<=", endOfDay).get();
    const [deliverySnapshot, issuanceSnapshot] = await Promise.all([deliveryLogsPromise, issuanceLogsPromise]);
    
    const allLogs = [
      ...deliverySnapshot.docs.map(doc => ({...doc.data(), type: 'DELIVERED'})),
      ...issuanceSnapshot.docs.map(doc => ({...doc.data(), type: 'ISSUED'}))
    ];

    if (allLogs.length === 0) {
      throw new HttpsError("not-found", "No data found for the selected date.");
    }
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(styleTemplate.sheet_properties.sheet_name || 'Report');

    Object.keys(styleTemplate.column_dimensions).forEach(col => sheet.getColumn(col).width = styleTemplate.column_dimensions[col]);
    Object.keys(styleTemplate.row_dimensions).forEach(rowNum => sheet.getRow(Number(rowNum)).height = styleTemplate.row_dimensions[rowNum]);
    styleTemplate.merged_cells.forEach(range => sheet.mergeCells(range));

    Object.keys(styleTemplate.styles).forEach(cellAddress => {
        sheet.getCell(cellAddress).style = translateStyle(styleTemplate.styles[cellAddress]);
    });

    Object.keys(styleTemplate.static_values).forEach(cellAddress => {
        sheet.getCell(cellAddress).value = styleTemplate.static_values[cellAddress];
    });
    sheet.getCell("D5").value = `DATE: ${reportDate}`;

    const reportData = allLogs.map((log, index) => ({
      sn: index + 1,
      description: log.materialDescription || "N/A",
      uom: (log.category || "").toLowerCase() === "pipes" ? "metres" : "pcs",
      matSapNo: "N/A",
      qtyExpected: "",
      qtyDelivered: log.type === 'DELIVERED' ? log.quantity : "", // Only show qty for delivered
      balance: "",
      remarks: log.remarks || "N/A",
      supplier: log.supplier,
    }));

    reportData.forEach((dataRow, index) => {
        const rowNum = 8 + index;
        const row = sheet.getRow(rowNum);
        row.getCell('A').value = dataRow.sn;
        row.getCell('B').value = dataRow.description;
        row.getCell('C').value = dataRow.uom;
        row.getCell('D').value = dataRow.matSapNo;
        row.getCell('E').value = dataRow.qtyExpected;
        row.getCell('F').value = dataRow.qtyDelivered;
        row.getCell('G').value = dataRow.balance;
        row.getCell('H').value = dataRow.remarks;
    });
    
    sheet.getColumn('G').hidden = true;
    sheet.getColumn('H').hidden = true;
    sheet.getCell('F7').value = "QTY RECEIVED/ISSUED";


    const supplierCounts = reportData.reduce((acc, curr) => {
        if (curr.supplier) acc[curr.supplier] = (acc[curr.supplier] || 0) + 1;
        return acc;
    }, {});
    let topSupplier = "N/A";
    const suppliers = Object.keys(supplierCounts);
    if (suppliers.length > 0) {
        topSupplier = suppliers.reduce((a, b) => supplierCounts[a] > supplierCounts[b] ? a : b);
    }
    sheet.getCell("H35").value = `WITNESSED BY (${topSupplier})`;

    const imageUrls = {
      companyLogo: "https://firebasestorage.googleapis.com/v0/b/sitsl-inventory-tracker.firebasestorage.app/o/Steve%20Logo.png?alt=media&token=6ee962df-2798-4b7a-81e4-311075a408b1",
      clientLogo: "https://firebasestorage.googleapis.com/v0/b/sitsl-inventory-tracker.firebasestorage.app/o/RENAISSANCE.jpg?alt=media&token=4167eee0-35f1-490f-96b1-fe4b61b4a998",
      signature: "https://firebasestorage.googleapis.com/v0/b/sitsl-inventory-tracker.firebasestorage.app/o/%5Bremoval.ai%5D_2c718afe-a296-4f4c-b20f-8cc641347c30-20240229_164012_0QZH4H.png?alt=media&token=e98ffcad-5bf5-4c40-8c58-23dbecbb1e8d",
    };

    const [companyLogoBuffer, clientLogoBuffer, signatureBuffer] = await Promise.all([
      getImageBuffer(imageUrls.companyLogo),
      getImageBuffer(imageUrls.clientLogo),
      getImageBuffer(imageUrls.signature),
    ]);
    
    if(companyLogoBuffer) {
        const companyLogoId = workbook.addImage({ buffer: companyLogoBuffer, extension: "png" });
        sheet.addImage(companyLogoId, 'A1:C4');
    }
    if(clientLogoBuffer) {
        const clientLogoId = workbook.addImage({ buffer: clientLogoBuffer, extension: "jpeg" });
        sheet.addImage(clientLogoId, 'L1:O4');
    }
    if(signatureBuffer) {
        const signatureId = workbook.addImage({ buffer: signatureBuffer, extension: "png" });
        sheet.addImage(signatureId, 'B35:D38');
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return { fileBuffer: buffer.toString("base64") };

  } catch (error) {
    logger.error("FATAL: Report generation failed:", error);
    throw new HttpsError("internal", "FATAL_ERROR: Report engine crashed. Please review server logs.", { details: error.message });
  }
});
