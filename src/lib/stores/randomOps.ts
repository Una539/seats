/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { ROWS, COLS } from './gridState';
import type { CellPosition } from '../types';

/** 随机填充操作所需的依赖接口 */
export interface RandomDeps {
	tableData: string[][];
	setTableData: (row: number, col: number, value: string) => void;
	isAisle: (col: number) => boolean;
	isDisabled: (row: number, col: number) => boolean;
	resetBatch: () => void;
}

/**
 * 创建随机填充逻辑。
 * 将名单中的姓名随机打乱后，分配到网格中可用的空座位上。
 */
export function createRandomFill(deps: RandomDeps) {
	/** 获取当前网格中所有可用（非过道、非禁用、非填充）的单元格位置 */
	function getAvailableCells(): CellPosition[] {
		const available: CellPosition[] = [];
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				if (deps.isAisle(c)) continue;
				if (deps.isDisabled(r, c)) continue;
				if (deps.tableData[r][c]) continue;
				available.push({ row: r, col: c });
			}
		}
		return available;
	}

	/**
	 * 将提供的姓名列表随机填入可用空座位。
	 * 若人数超过可用座位数，则弹出提示并中止操作。
	 */
	function randomFill(lines: string[], onLinesUpdate: (newLines: string[]) => void) {
		const available = getAvailableCells();
		if (lines.length > available.length) {
			alert(
				`名单人数（${lines.length}）超过可用空白单元格数（${available.length}），无法完成随机填入。`
			);
			return;
		}

		// Fisher-Yates 洗牌算法：打乱可用座位顺序
		for (let i = available.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[available[i], available[j]] = [available[j], available[i]];
		}

		// Fisher-Yates 洗牌算法：打乱姓名顺序
		const namesToFill = [...lines];
		for (let i = namesToFill.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[namesToFill[i], namesToFill[j]] = [namesToFill[j], namesToFill[i]];
		}

		// 依次将打乱后的姓名填入打乱后的空座位
		for (let i = 0; i < namesToFill.length; i++) {
			const { row, col } = available[i];
			deps.setTableData(row, col, namesToFill[i]);
		}
		onLinesUpdate([]);
		deps.resetBatch();
	}

	return { getAvailableCells, randomFill };
}
