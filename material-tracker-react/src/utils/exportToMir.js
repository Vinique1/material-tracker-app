// src/utils/exportToMir.js
// REMOVED: Static imports are no longer needed at the top.
// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
import mirTemplate from '../data/mir-template.json';

// Helper to fetch images from the public folder or a URL
const getImageAsBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok for ${url}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to fetch image at URL: ${url}`, error);
    return null;
  }
};

// Helper to format the border style object for ExcelJS
const getBorderStyle = (styleName) => {
  if (!styleName) return undefined;
  return { style: styleName };
};

// Main export function with the new dynamic logic
export const exportToMir = async (deliveryLogs, reportDetails) => {
  // --- MODIFICATION START: Dynamically import heavy libraries ---
  const ExcelJS = (await import('exceljs')).default;
  const { saveAs } = await import('file-saver');
  // --- MODIFICATION END ---

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(
    mirTemplate.sheet_properties.sheet_name || 'MIR',
  );

  // --- 1. Isolate Template Sections ---
  const headerRows = mirTemplate.rows.filter((r) => r.row_index <= 7);
  const dataRowTemplate = mirTemplate.rows.find((r) => r.row_index === 8);
  const blankRowTemplate = mirTemplate.rows.find((r) => r.row_index === 30);
  const footerRows = mirTemplate.rows.filter((r) => r.row_index >= 31);

  // --- 2. Build Static Header (Rows 1-7) ---
  headerRows.forEach((rowData) => {
    if (rowData.cells) {
      rowData.cells.forEach((cellData) => {
        if (cellData.merged_cells) {
          worksheet.mergeCells(cellData.merged_cells);
        }
      });
      rowData.cells.forEach((cellData) => {
        const cell = worksheet.getCell(cellData.cell_address);
        cell.value = cellData.value;
        cell.font = {
          name: cellData.font.name || 'Calibri',
          size: cellData.font.size || 11,
          bold: cellData.font.bold || false,
          color: {
            argb:
              cellData.font.color && cellData.font.color.startsWith('#')
                ? `FF${cellData.font.color.substring(1)}`
                : 'FF000000',
          },
        };
        cell.alignment = {
          horizontal: cellData.alignment.horizontal || 'left',
          vertical: cellData.alignment.vertical || 'center',
          wrapText: cellData.alignment.wrap_text || false,
        };
        cell.border = {
          top: getBorderStyle(cellData.border.top),
          left: getBorderStyle(cellData.border.left),
          bottom: getBorderStyle(cellData.border.bottom),
          right: getBorderStyle(cellData.border.right),
        };
        if (cellData.number_format && cellData.number_format !== 'General') {
          cell.numFmt = cellData.number_format;
        }
      });
    }
  });
  worksheet.getCell('L2').value = reportDetails.sheetNo || 1;
  worksheet.getCell('L3').value = new Date(reportDetails.date || new Date());
  worksheet.getCell('L4').value =
    reportDetails.docNo || 'SITSL/GBARAN/25/QMS/MIR/001';

  // --- 3. Build Dynamic Data Section ---
  const dataRowStartIndex = 8;
  const logsCount = deliveryLogs.length;

  if (logsCount > 0) {
    deliveryLogs.forEach((log, index) => {
      const rowNumber = dataRowStartIndex + index;
      const row = worksheet.getRow(rowNumber);

      row.getCell('A').value = index + 1;
      row.getCell('B').value = log.materialDescription;
      row.getCell('I').value =
        log.category?.toLowerCase() === 'pipes' ? 'metres' : 'pcs';
      row.getCell('J').value = log.quantity;
      row.getCell('K').value = 'N/A';
      row.getCell('M').value = log.remarks || 'EXCELLENT CONDITION';

      worksheet.mergeCells(`B${rowNumber}:H${rowNumber}`);
      worksheet.mergeCells(`K${rowNumber}:L${rowNumber}`);
      worksheet.mergeCells(`M${rowNumber}:O${rowNumber}`);

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { name: 'Calibri', size: 11 };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'center',
          wrapText: true,
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      row.getCell('B').alignment.horizontal = 'left';
      row.getCell('A').border.left = { style: 'medium' };
      row.getCell('O').border.right = { style: 'medium' };
    });
  }

  // --- 4. Build Dynamic Footer ---
  const lastDataRowIndex = dataRowStartIndex + logsCount - 1;
  const footerStartIndex = lastDataRowIndex + 2;

  const blankRowIndex = footerStartIndex - 1;
  worksheet.mergeCells(`A${blankRowIndex}:O${blankRowIndex}`);
  const blankCell = worksheet.getCell(`A${blankRowIndex}`);
  blankCell.style = {
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'medium' },
      right: { style: 'medium' },
    },
  };

  footerRows.forEach((footerRowData) => {
    const newRowIndex = footerStartIndex + (footerRowData.row_index - 31);
    const newRow = worksheet.getRow(newRowIndex);

    if (footerRowData.cells) {
      footerRowData.cells.forEach((cellData) => {
        if (cellData.merged_cells) {
          const newRange = cellData.merged_cells.replace(/\d+/g, newRowIndex);
          worksheet.mergeCells(newRange);
        }
      });
      footerRowData.cells.forEach((cellData) => {
        const colLetter = cellData.cell_address.match(/[A-Z]+/)[0];
        const cell = newRow.getCell(colLetter);
        cell.value = cellData.value;
        cell.font = {
          name: cellData.font.name || 'Calibri',
          size: cellData.font.size || 11,
          bold: cellData.font.bold || false,
          color: {
            argb:
              cellData.font.color && cellData.font.color.startsWith('#')
                ? `FF${cellData.font.color.substring(1)}`
                : 'FF000000',
          },
        };
        cell.alignment = {
          horizontal: cellData.alignment.horizontal || 'left',
          vertical: cellData.alignment.vertical || 'center',
          wrapText: cellData.alignment.wrap_text || false,
        };
        cell.border = {
          top: getBorderStyle(cellData.border.top),
          left: getBorderStyle(cellData.border.left),
          bottom: getBorderStyle(cellData.border.bottom),
          right: getBorderStyle(cellData.border.right),
        };
      });
    }
  });

  const receivedByNameCell = worksheet.getCell(`C${footerStartIndex + 1}`);
  receivedByNameCell.value = reportDetails.receivedBy?.name || 'VICTOR IKEH';
  const receivedByPosCell = worksheet.getCell(`C${footerStartIndex + 2}`);
  receivedByPosCell.value =
    reportDetails.receivedBy?.position || 'QAQC ENGINEER';
  const receivedByDateCell = worksheet.getCell(`C${footerStartIndex + 4}`);
  receivedByDateCell.value = new Date(reportDetails.date || new Date());
  receivedByDateCell.numFmt = 'mm-dd-yy';

  // --- 5. Add Images Dynamically ---
  worksheet.getCell('A1').value = null;
  worksheet.getCell('N1').value = null;

  const imageUrls = {
    companyLogo: '/images/steve-logo.png',
    clientLogo: '/images/renaissance-logo.jpg',
    signature: '/images/signature.png',
  };

  const [companyLogoB64, clientLogoB64, signatureB64] = await Promise.all([
    getImageAsBase64(imageUrls.companyLogo),
    getImageAsBase64(imageUrls.clientLogo),
    getImageAsBase64(imageUrls.signature),
  ]);

  if (companyLogoB64) {
    const companyLogoId = workbook.addImage({
      base64: companyLogoB64,
      extension: 'png',
    });
    worksheet.addImage(companyLogoId, 'A1:C4');
  }
  if (clientLogoB64) {
    const clientLogoId = workbook.addImage({
      base64: clientLogoB64,
      extension: 'jpeg',
    });
    worksheet.addImage(clientLogoId, 'N1:O4');
  }
  if (signatureB64) {
    const signatureRow = footerStartIndex + 3;
    worksheet.getCell(`C${signatureRow}`).value = null;
    const signatureId = workbook.addImage({
      base64: signatureB64,
      extension: 'png',
    });
    worksheet.addImage(signatureId, `C${signatureRow}:G${signatureRow}`);
  }

  // --- 6. Set Column Widths ---
  worksheet.getColumn('A').width = 5;
  worksheet.getColumn('B').width = 15;
  // ... (set other column widths as needed)
  worksheet.getColumn('O').width = 12;

  // --- 7. Generate and Download File ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.sheet',
  });
  saveAs(blob, `MIR_Report_${reportDetails.date || 'export'}.xlsx`);
};