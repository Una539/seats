/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import * as ExcelJS from 'exceljs';
import type { useSeatGrid } from './stores/useSeatGrid';

/** useSeatGrid 返回类型的别名，用于类型约束 */
type Grid = ReturnType<typeof useSeatGrid>;

/**
 * 将当前座位网格导出为 XLSX 文件。
 * 自动识别有数据的行范围，并在表格中标注前后门、讲桌及过道位置。
 */
export async function exportToXlsx(grid: Grid, filename: string = 'seats.xlsx') {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('座位表');

	/** 单元格统一边框样式 */
	const borderStyle = {
		top: { style: 'thin' as const },
		left: { style: 'thin' as const },
		bottom: { style: 'thin' as const },
		right: { style: 'thin' as const }
	};

	// 遍历网格，找出包含有效数据的最小和最大行号，以压缩导出范围
	let minDataRow = 10;
	let maxDataRow = -1;
	for (let row = 0; row < 10; row++) {
		for (let col = 0; col < 10; col++) {
			if (!grid.isAisle(col)) {
				const isDisabled = grid.isDisabled(row, col);
				const cellValue = grid.tableData[row][col];
				if (!isDisabled && cellValue) {
					if (row < minDataRow) minDataRow = row;
					if (row > maxDataRow) maxDataRow = row;
				}
			}
		}
	}

	// 若无任何有效数据，则默认导出全部 10 行
	if (maxDataRow === -1) {
		minDataRow = 0;
		maxDataRow = 9;
	}

	const dataRowCount = maxDataRow - minDataRow + 1;
	/** 将网格行号映射为 Excel 行号（翻转顺序，使第 0 行显示在最上方） */
	const rowToExcel = (row: number) => maxDataRow - row + 1;

	// 在后门位置（Excel 第 1 行）标注文字
	const backDoorCell = worksheet.getCell(1, 1);
	backDoorCell.value = '后门';
	backDoorCell.font = { bold: true, size: 14 };
	backDoorCell.alignment = { vertical: 'middle', horizontal: 'center' };
	backDoorCell.border = borderStyle;

	// 在前门位置（Excel 最后一行）标注文字
	const frontDoorCell = worksheet.getCell(dataRowCount, 1);
	frontDoorCell.value = '前门';
	frontDoorCell.font = { bold: true, size: 14 };
	frontDoorCell.alignment = { vertical: 'middle', horizontal: 'center' };
	frontDoorCell.border = borderStyle;

	// 遍历有效数据行，写入座位姓名并处理过道合并单元格
	for (let row = minDataRow; row <= maxDataRow; row++) {
		const excelRow = rowToExcel(row);
		for (let col = 0; col < 10; col++) {
			if (grid.isAisle(col)) {
				// 过道列只在第一行时合并整个区域，避免重复操作
				if (row === minDataRow) {
					const startCol = col + 2;
					const startRow = 1;
					const endRow = dataRowCount;
					worksheet.mergeCells(startRow, startCol, endRow, startCol);
					const mergedCell = worksheet.getCell(startRow, startCol);
					mergedCell.value = '过道';
					mergedCell.font = { bold: true, color: { argb: 'FF000000' }, size: 14 };
					mergedCell.alignment = { vertical: 'middle', horizontal: 'center' };
					for (let r = startRow; r <= endRow; r++) {
						for (let c = startCol; c <= startCol; c++) {
							worksheet.getCell(r, c).border = borderStyle;
						}
					}
				}
			} else {
				// 写入普通座位的姓名并应用边框样式
				const isDisabled = grid.isDisabled(row, col);
				const cellValue = grid.tableData[row][col];
				if (!isDisabled) {
					const excelCol = col + 2;
					const cell = worksheet.getCell(excelRow, excelCol);
					if (cellValue) cell.value = cellValue;
					cell.border = borderStyle;
					cell.alignment = { vertical: 'middle', horizontal: 'center' };
				}
			}
		}
	}

	// 在最后一行下方添加讲桌区域，合并整行
	const deskRowNum = dataRowCount + 1;
	const deskCell = worksheet.getCell(deskRowNum, 2);
	deskCell.value = '讲桌';
	deskCell.font = { bold: true, size: 16 };
	deskCell.alignment = { vertical: 'middle', horizontal: 'center' };
	worksheet.mergeCells(deskRowNum, 2, deskRowNum, 11);
	for (let c = 2; c <= 11; c++) {
		worksheet.getCell(deskRowNum, c).border = borderStyle;
	}
	worksheet.getRow(deskRowNum).height = 35;

	// 统一设置所有行高和列宽
	for (let r = 1; r <= deskRowNum; r++) {
		worksheet.getRow(r).height = 40;
	}
	for (let c = 2; c <= 11; c++) {
		worksheet.getColumn(c).width = 18;
	}
	worksheet.getColumn(1).width = 10;

	// 生成 Blob 并触发浏览器下载
	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
