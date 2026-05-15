/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { ROWS } from './gridState';

/** 创建过道操作所需的依赖接口 */
export interface AisleDeps {
	tableData: string[][];
	setTableData: (row: number, col: number, value: string) => void;
	aisleColumns: () => number[];
	setAisleColumns: (v: number[] | ((prev: number[]) => number[])) => void;
	setDisabledCells: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
}

/**
 * 创建过道相关操作函数。
 * 支持检测某列是否为过道，以及切换列的过道状态。
 * 切换为过道时会清空该列数据并解除禁用；取消过道时会一并归还该列上的学生姓名。
 */
export function createAisleActions(deps: AisleDeps) {
	/** 判断指定列是否为过道 */
	function isAisle(col: number): boolean {
		return deps.aisleColumns().includes(col);
	}

	/**
	 * 切换指定列的过道状态。
	 * @returns 被挤出的学生姓名列表（从过道恢复为座位时产生）
	 */
	function toggleAisle(col: number): string[] {
		const displaced: string[] = [];
		if (isAisle(col)) {
			// 取消过道：将该列从 aisleColumns 中移除，并解除所有行禁用
			deps.setAisleColumns((prev) => prev.filter((c) => c !== col));
			for (let row = 0; row < ROWS; row++) {
				deps.setTableData(row, col, '');
				deps.setDisabledCells((prev) => {
					const next = new Set(prev);
					next.delete(`${row}-${col}`);
					return next;
				});
			}
		} else {
			// 设置过道：收集该列上已有学生姓名，清空数据并加入 aisleColumns
			for (let row = 0; row < ROWS; row++) {
				const name = deps.tableData[row][col];
				if (name) displaced.push(name);
				deps.setTableData(row, col, '');
				deps.setDisabledCells((prev) => {
					const next = new Set(prev);
					next.delete(`${row}-${col}`);
					return next;
				});
			}
			deps.setAisleColumns((prev) => [...prev, col]);
		}
		return displaced;
	}

	return { isAisle, toggleAisle };
}
