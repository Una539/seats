/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import type { CellPosition } from '../types';

/** 单元格变更操作所需的依赖接口 */
export interface CellDeps {
	tableData: string[][];
	setTableData: (row: number, col: number, value: string) => void;
	disabledCells: () => Set<string>;
	setDisabledCells: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
	pendingClear: () => Set<string>;
	setPendingClear: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
	swapFirst: () => CellPosition | null;
	setSwapFirst: (v: CellPosition | null) => void;
}

/** 创建单元格级别的变更操作，包括禁用检测、清空单元格、交换两个单元格内容 */
export function createCellMutations(deps: CellDeps) {
	/** 判断指定单元格是否被禁用 */
	function isDisabled(row: number, col: number): boolean {
		return deps.disabledCells().has(`${row}-${col}`);
	}

	/** 清空指定单元格，并将原姓名通过回调归还到名单 */
	function clearCell(row: number, col: number, onNameReturn: (name: string) => void) {
		const name = deps.tableData[row][col];
		if (name) {
			deps.setTableData(row, col, '');
			onNameReturn(name);
		}
	}

	/** 交换两个单元格中的学生姓名，仅在两者都有姓名时生效 */
	function swapCells(row1: number, col1: number, row2: number, col2: number) {
		const name1 = deps.tableData[row1][col1];
		const name2 = deps.tableData[row2][col2];
		if (!name1 || !name2) return;
		deps.setTableData(row1, col1, name2);
		deps.setTableData(row2, col2, name1);
		deps.setSwapFirst(null);
	}

	return { isDisabled, clearCell, swapCells };
}
