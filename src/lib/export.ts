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
 * - 模拟老师在讲台上的视角：表格最下面是讲台，左侧是门
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

	// 添加前门（左侧，第1行）
	const frontDoorCell = worksheet.getCell(1, 1);
	frontDoorCell.value = '前门';
	frontDoorCell.font = { bold: true, size: 14 };
	frontDoorCell.alignment = { vertical: 'middle', horizontal: 'center' };
	frontDoorCell.border = borderStyle;

	// 计算实际有数据的最后一行（原数据从后往前映射）
	let maxDataRow = 1;
	for (let row = 0; row < 10; row++) {
		for (let col = 0; col < 10; col++) {
			if (!grid.isAisle(col)) {
				const isDisabled = grid.isDisabled(row, col);
				const cellValue = grid.tableData[row][col];
				if (!isDisabled && cellValue) {
					// 将原数据的行翻转：原第9行（最后排）对应excel第1行，原第0行（最前排）对应excel第9行
					const excelRow = 10 - row;
					if (excelRow > maxDataRow) {
						maxDataRow = excelRow;
					}
				}
			}
		}
	}

	// 添加后门（左侧，最后一行）
	const backDoorCell = worksheet.getCell(maxDataRow, 1);
	backDoorCell.value = '后门';
	backDoorCell.font = { bold: true, size: 14 };
	backDoorCell.alignment = { vertical: 'middle', horizontal: 'center' };
	backDoorCell.border = borderStyle;

	// 添加座位网格（行1-10，列2-11）
	// 行从后往前映射：原数据行9（最后排）-> excel行1，原数据行0（最前排）-> excel行10
	for (let row = 0; row < 10; row++) {
		const excelRow = 10 - row; // 翻转行，从后往前

		// 处理过道列
		for (let col = 0; col < 10; col++) {
			if (grid.isAisle(col)) {
				if (row === 0) {
					// 只在第一行（原数据最后排）合并过道
					const startCol = col + 2; // 列偏移+1（因为有门在列1）
					const endCol = col + 2;
					const startRow = 1;
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
					const excelCol = col + 2; // 列偏移+1（因为有门在列1）
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

	// 添加讲桌（在底部，即行11，列2-11）
	const deskRowNum = Math.max(11, maxDataRow + 1);
	worksheet.addRow([]);
	const deskRow = worksheet.getRow(deskRowNum);
	deskRow.height = 35;
	const deskCell = worksheet.getCell(deskRowNum, 2);
	deskCell.value = '讲桌';
	deskCell.font = { bold: true, size: 16 };
	deskCell.alignment = { vertical: 'middle', horizontal: 'center' };
	worksheet.mergeCells(deskRowNum, 2, deskRowNum, 11);
	for (let c = 2; c <= 11; c++) {
		worksheet.getCell(deskRowNum, c).border = borderStyle;
	}

	// 设置列宽和行高
	for (let r = 1; r <= deskRowNum; r++) {
		worksheet.getRow(r).height = 40;
	}
	for (let c = 2; c <= 11; c++) {
		worksheet.getColumn(c).width = 18;
	}
	worksheet.getColumn(1).width = 10; // 门所在列

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
