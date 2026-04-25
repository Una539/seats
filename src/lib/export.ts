/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 *
 * seats is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * seats is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with seats. If not, see <https://www.gnu.org/licenses/>.
 */

import * as ExcelJS from 'exceljs';
import type { SeatGridState } from '$lib/stores.svelte';

/**
 * 导出座位网格为 xlsx 文件
 * - 不显示弃用的座位
 * - 过道处合并单元格并显示为"过道"
 * - 单元格之间加入完全边框
 * - 顶部显示讲桌，右侧显示前门/后门
 */
export async function exportToXlsx(grid: SeatGridState, filename: string = 'seats.xlsx') {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('座位表');

	const borderStyle = {
		top: { style: 'thin' as const },
		left: { style: 'thin' as const },
		bottom: { style: 'thin' as const },
		right: { style: 'thin' as const }
	};

	worksheet.addRow(['讲桌']);
	const deskRow = worksheet.getRow(1);
	deskRow.height = 35;
	const deskCell = worksheet.getCell(1, 1);
	deskCell.value = '讲桌';
	deskCell.font = { bold: true, size: 16 };
	deskCell.alignment = { vertical: 'middle', horizontal: 'center' };
	worksheet.mergeCells(1, 1, 1, 10);
	for (let c = 1; c <= 10; c++) {
		worksheet.getCell(1, c).border = borderStyle;
	}

	const frontDoorCell = worksheet.getCell(2, 12);
	frontDoorCell.value = '前门';
	frontDoorCell.font = { bold: true, size: 14 };
	frontDoorCell.alignment = { vertical: 'middle', horizontal: 'center' };
	frontDoorCell.border = borderStyle;

	let maxDataRow = 2;
	for (let row = 0; row < 10; row++) {
		for (let col = 0; col < 10; col++) {
			if (!grid.isAisle(col)) {
				const isDisabled = grid.isDisabled(row, col);
				const cellValue = grid.tableData[row][col];
				if (!isDisabled && cellValue) {
					const excelRow = row + 2;
					if (excelRow > maxDataRow) {
						maxDataRow = excelRow;
					}
				}
			}
		}
	}

	const backDoorCell = worksheet.getCell(maxDataRow, 12);
	backDoorCell.value = '后门';
	backDoorCell.font = { bold: true, size: 14 };
	backDoorCell.alignment = { vertical: 'middle', horizontal: 'center' };
	backDoorCell.border = borderStyle;

	for (let row = 0; row < 10; row++) {
		for (let col = 0; col < 10; col++) {
			if (!grid.isAisle(col)) {
				const isDisabled = grid.isDisabled(row, col);
				const cellValue = grid.tableData[row][col];
				if (!isDisabled && cellValue) {
					const excelRow = row + 2;
					if (excelRow > maxDataRow) {
						maxDataRow = excelRow;
					}
				}
			}
		}
	}

	for (let row = 0; row < 10; row++) {
		for (let col = 0; col < 10; col++) {
			if (grid.isAisle(col)) {
				if (row === 0) {
					const startCol = col + 1;
					const endCol = col + 1;
					const startRow = 2;
					const endRow = maxDataRow;

					worksheet.mergeCells(startRow, startCol, endRow, endCol);
					const mergedCell = worksheet.getCell(startRow, startCol);
					mergedCell.value = '过道';
					mergedCell.font = { bold: true, color: { argb: 'FF000000' }, size: 14 };
					mergedCell.alignment = { vertical: 'middle', horizontal: 'center' };

					for (let r = startRow; r <= endRow; r++) {
						for (let c = startCol; c <= endCol; c++) {
							const cell = worksheet.getCell(r, c);
							cell.border = borderStyle;
						}
					}
				}
			} else {
				const isDisabled = grid.isDisabled(row, col);
				const cellValue = grid.tableData[row][col];

				if (!isDisabled) {
					const excelRow = row + 2;
					const excelCol = col + 1;
					const cell = worksheet.getCell(excelRow, excelCol);

					if (cellValue) {
						cell.value = cellValue;
					}

					cell.border = borderStyle;
					cell.alignment = { vertical: 'middle', horizontal: 'center' };
				}
			}
		}
	}

	for (let r = 2; r <= Math.max(11, maxDataRow); r++) {
		worksheet.getRow(r).height = 40;
		for (let c = 1; c <= 10; c++) {
			worksheet.getColumn(c).width = 18;
		}
	}

	worksheet.getColumn(12).width = 10;

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
