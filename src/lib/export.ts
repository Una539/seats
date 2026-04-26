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
 * - 前门在左下角，后门在左上角
 * - 去掉没有坐人的排
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

	// 找出有数据的行的最小和最大索引（原数据：0=前排，9=后排）
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

	// 如果没有数据，默认显示所有行
	if (maxDataRow === -1) {
		minDataRow = 0;
		maxDataRow = 9;
	}

	// 计算实际有数据的行数
	const dataRowCount = maxDataRow - minDataRow + 1;

	// 构建行映射：原数据行 -> Excel行（从后往前排列）
	// 原数据最后一排（maxDataRow）-> Excel第1行（后门所在）
	// 原数据第一排（minDataRow）-> Excel第dataRowCount行（前门所在）
	const rowToExcel = (row: number) => maxDataRow - row + 1;

	// 添加后门（左上角，Excel第1行，列1）
	const backDoorCell = worksheet.getCell(1, 1);
	backDoorCell.value = '后门';
	backDoorCell.font = { bold: true, size: 14 };
	backDoorCell.alignment = { vertical: 'middle', horizontal: 'center' };
	backDoorCell.border = borderStyle;

	// 添加前门（左下角，Excel第dataRowCount行，列1）
	const frontDoorCell = worksheet.getCell(dataRowCount, 1);
	frontDoorCell.value = '前门';
	frontDoorCell.font = { bold: true, size: 14 };
	frontDoorCell.alignment = { vertical: 'middle', horizontal: 'center' };
	frontDoorCell.border = borderStyle;

	// 添加座位网格
	for (let row = minDataRow; row <= maxDataRow; row++) {
		const excelRow = rowToExcel(row);

		// 处理过道列
		for (let col = 0; col < 10; col++) {
			if (grid.isAisle(col)) {
				if (row === minDataRow) {
					const startCol = col + 2;
					const endCol = col + 2;
					const startRow = 1;
					const endRow = dataRowCount;

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
					const excelCol = col + 2;
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

	// 添加讲桌（底部，列2-11）
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

	// 设置列宽和行高
	for (let r = 1; r <= deskRowNum; r++) {
		worksheet.getRow(r).height = 40;
	}
	for (let c = 2; c <= 11; c++) {
		worksheet.getColumn(c).width = 18;
	}
	worksheet.getColumn(1).width = 10;

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
