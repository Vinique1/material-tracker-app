const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const ExcelJS = require("exceljs");
const axios = require("axios");

// Initialize the Admin SDK only if it hasn't been already.
// This is the best practice to avoid deployment timeouts.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Helper function to fetch an image from a URL and return a buffer
const getImageBuffer = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary");
  } catch (error) {
    logger.error(`Failed to fetch image at URL: ${url}`, error.message);
    return null; // Return null if image fails to download
  }
};

exports.getReportPreviewData = onCall({ timeoutSeconds: 120 }, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in.");
    }
    const { reportDate } = request.data;
    if (!reportDate) {
        throw new HttpsError("invalid-argument", "A report date must be provided.");
    }

    try {
        const startOfDay = new Date(`${reportDate}T00:00:00`);
        const endOfDay = new Date(`${reportDate}T23:59:59`);
        
        const deliveryLogsPromise = db.collection("delivery_logs").where("date", ">=", startOfDay).where("date", "<=", endOfDay).get();
        const issuanceLogsPromise = db.collection("issuance_logs").where("date", ">=", startOfDay).where("date", "<=", endOfDay).get();
        
        const [deliverySnapshot, issuanceSnapshot] = await Promise.all([deliveryLogsPromise, issuanceLogsPromise]);
        
        const allLogs = [
            ...deliverySnapshot.docs.map(doc => ({...doc.data(), type: 'DELIVERED'})),
            ...issuanceSnapshot.docs.map(doc => ({...doc.data(), type: 'ISSUED'}))
        ];

        if (allLogs.length === 0) {
            return { reportData: [] };
        }

        const reportData = allLogs.map((log, index) => ({
            sn: index + 1,
            description: log.materialDescription,
            qty: log.quantity,
            type: log.type,
            remarks: log.remarks || "N/A",
        }));
        
        return { reportData };
    } catch (error) {
        logger.error("Preview data fetch failed:", error);
        throw new HttpsError("internal", "Failed to fetch preview data.");
    }
});

exports.generateInspectionReport = onCall({ timeoutSeconds: 300 }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }
  const { reportDate } = request.data;
  if (!reportDate) {
    throw new HttpsError("invalid-argument", "A report date must be provided.");
  }

  try {
    const startOfDay = new Date(`${reportDate}T00:00:00`);
    const endOfDay = new Date(`${reportDate}T23:59:59`);
    
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

    const reportData = allLogs.map((log, index) => ({
        sn: index + 1,
        description: log.materialDescription || "N/A",
        uom: (log.category || "").toLowerCase() === "pipes" ? "metres" : "pcs",
        matSapNo: "N/A",
        qty: log.quantity,
        type: log.type,
        remarks: log.remarks || "N/A",
        supplier: log.supplier,
    }));

    const supplierCounts = reportData.reduce((acc, curr) => {
      if (curr.supplier) acc[curr.supplier] = (acc[curr.supplier] || 0) + 1;
      return acc;
    }, {});
    
    let topSupplier = "N/A";
    if (Object.keys(supplierCounts).length > 0) {
        topSupplier = Object.keys(supplierCounts).reduce((a, b) => supplierCounts[a] > supplierCounts[b] ? a : b);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.properties.defaultFont = { name: 'Arial', size: 10 };

    const sheet = workbook.addWorksheet("Inspection Report");

    const companyLogoUrl = "https://firebasestorage.googleapis.com/v0/b/sitsl-inventory-tracker.firebasestorage.app/o/Steve%20Logo.png?alt=media&token=6ee962df-2798-4b7a-81e4-311075a408b1";
    const clientLogoUrl = "https://firebasestorage.googleapis.com/v0/b/sitsl-inventory-tracker.firebasestorage.app/o/RENAISSANCE.jpg?alt=media&token=4167eee0-35f1-490f-96b1-fe4b61b4a998";
    const signatureUrl = "https://firebasestorage.googleapis.com/v0/b/sitsl-inventory-tracker.firebasestorage.app/o/%5Bremoval.ai%5D_2c718afe-a296-4f4c-b20f-8cc641347c30-20240229_164012_0QZH4H.png?alt=media&token=e98ffcad-5bf5-4c40-8c58-23dbecbb1e8d";
    
    const [companyLogoBuffer, clientLogoBuffer, signatureBuffer] = await Promise.all([
      getImageBuffer(companyLogoUrl),
      getImageBuffer(clientLogoUrl),
      getImageBuffer(signatureUrl),
    ]);

    if (companyLogoBuffer) {
        const companyLogoImgId = workbook.addImage({ buffer: companyLogoBuffer, extension: "png" });
        sheet.addImage(companyLogoImgId, "A1:B3");
    }
    if (clientLogoBuffer) {
        const clientLogoImgId = workbook.addImage({ buffer: clientLogoBuffer, extension: "jpeg" });
        sheet.addImage(clientLogoImgId, "H1:I3");
    }
    
    sheet.mergeCells("C1:G2");
    sheet.getCell("C1").value = "GBARAN MATERIALS INSPECTION REPORT";
    sheet.getCell("C1").alignment = { vertical: "middle", horizontal: "center" };
    sheet.getCell("C1").font = { bold: true, size: 16 };

    sheet.mergeCells("C3:G3");
    sheet.getCell("C3").value = `DATE: ${reportDate}`;
    sheet.getCell("C3").alignment = { horizontal: "center" };
    sheet.getCell("C3").font = { bold: true };
    
    sheet.getCell("I1").value = "CONTRACT NO:";
    sheet.getCell("I2").value = "SHEET NO:";
    sheet.getCell("I3").value = "DOC NO:";

    const columns = [
        { header: 'S/N', key: 'sn', width: 5 },
        { header: 'DESCRIPTION', key: 'description', width: 40 },
        { header: 'UOM', key: 'uom', width: 10 },
        { header: 'MAT. SAP NO.', key: 'matSapNo', width: 15 },
        { header: 'QTY', key: 'qty', width: 15 },
        { header: 'TYPE', key: 'type', width: 15 },
        { header: 'REMARKS', key: 'remarks', width: 30 },
    ];
    sheet.columns = columns;
    sheet.getRow(5).font = { bold: true };
    sheet.getRow(5).alignment = { horizontal: "center" };

    sheet.addRows(reportData);
    
    const lastRow = sheet.lastRow ? sheet.lastRow.number : 6;
    if (signatureBuffer) {
        const signatureImageId = workbook.addImage({ buffer: signatureBuffer, extension: "png" });
        sheet.addImage(signatureImageId, { tl: { col: 1, row: lastRow + 2 }, ext: { width: 100, height: 40 } });
    }
    sheet.getCell(`B${lastRow + 5}`).value = "___________________\nTechnip Inspector";
    
    sheet.getCell(`F${lastRow + 5}`).value = `witnessed by (${topSupplier})`;
    sheet.getCell(`F${lastRow + 6}`).value = "___________________";

    const buffer = await workbook.xlsx.writeBuffer();
    return { fileBuffer: buffer.toString("base64") };

  } catch (error) {
    logger.error("Report generation failed:", error);
    throw new HttpsError("internal", error.message || "Failed to generate the report.");
  }
});