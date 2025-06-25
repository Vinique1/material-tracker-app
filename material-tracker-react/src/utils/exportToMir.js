// src/utils/exportToMir.js
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import mirTemplate from '../data/mir-template.json';

const getBorderStyle = (styleName) => {
  if (!styleName) return undefined;
  return { style: styleName };
};

export const exportToMir = async (deliveryLogs, reportDetails) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(mirTemplate.sheet_properties.sheet_name || 'MIR');

  // --- STEP 1: Build the entire template structure and style from JSON ---

  // First, find and apply ALL unique merge ranges from the entire template.
  const uniqueMerges = new Set();
  mirTemplate.rows.forEach(row => {
    if (row.cells) {
      row.cells.forEach(cell => {
        if (cell.merged_cells) {
          uniqueMerges.add(cell.merged_cells);
        }
      });
    }
  });
  uniqueMerges.forEach(range => {
    worksheet.mergeCells(range);
  });

  // Second, apply all static values and styles from the template.
  mirTemplate.rows.forEach(rowData => {
    if (rowData.cells) {
      rowData.cells.forEach(cellData => {
        const cell = worksheet.getCell(cellData.cell_address);

        // Set values, including placeholder data for the item rows
        if (cellData.cell_address === 'L2') {
          cell.value = reportDetails.sheetNo || 1;
        } else if (cellData.cell_address === 'L3') {
          cell.value = new Date(reportDetails.date || new Date());
        } else if (cellData.cell_address === 'L4') {
          cell.value = reportDetails.docNo || 'SITSL/GBARAN/25/QMS/MIR/001';
        } else {
          cell.value = cellData.value;
        }

        // Apply styles
        cell.font = {
          name: cellData.font.name || 'Calibri',
          size: cellData.font.size || 11,
          bold: cellData.font.bold || false,
          color: { argb: (cellData.font.color && cellData.font.color.startsWith('#')) ? `FF${cellData.font.color.substring(1)}` : 'FF000000' }
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

  // --- STEP 2: Overwrite placeholder rows with dynamic data ---
  const dataRowStartIndex = 8;
  if (deliveryLogs && deliveryLogs.length > 0) {
    deliveryLogs.forEach((log, index) => {
      const rowNumber = dataRowStartIndex + index;
      
      // Safety check to prevent overwriting the static footer
      if (rowNumber >= 31) {
        console.warn(`Stopping data injection at row ${rowNumber} to avoid overwriting footer.`);
        return;
      }

      const row = worksheet.getRow(rowNumber);

      // Simply overwrite the values. Styles and merges are already applied.
      row.getCell('A').value = index + 1;
      row.getCell('B').value = log.materialDescription;
      row.getCell('I').value = log.category?.toLowerCase() === 'pipes' ? 'metres' : 'pcs';
      row.getCell('J').value = log.quantity;
      row.getCell('K').value = 'N/A';
      row.getCell('M').value = log.remarks || 'EXCELLENT CONDITION';
    });
  }

  // --- STEP 3: Set Column Widths ---
  worksheet.getColumn('A').width = 5;
  worksheet.getColumn('B').width = 15;
  worksheet.getColumn('C').width = 10;
  worksheet.getColumn('D').width = 10;
  worksheet.getColumn('E').width = 10;
  worksheet.getColumn('F').width = 10;
  worksheet.getColumn('G').width = 10;
  worksheet.getColumn('H').width = 10;
  worksheet.getColumn('I').width = 8;
  worksheet.getColumn('J').width = 8;
  worksheet.getColumn('K').width = 10;
  worksheet.getColumn('L').width = 10;
  worksheet.getColumn('M').width = 12;
  worksheet.getColumn('N').width = 12;
  worksheet.getColumn('O').width = 12;

  // --- STEP 4: Generate and Download File ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `MIR_Report_${reportDetails.date || 'export'}.xlsx`);
};