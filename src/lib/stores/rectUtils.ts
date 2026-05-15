/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import type { CellPosition } from '../types';

/**
 * 获取由 start 和 end 两个点围成的矩形区域内，满足 filter 条件的单元格键值集合。
 * 键值格式为 "row-col"，常用于批量操作座位。
 */
export function getRectKeys(
	start: CellPosition,
	end: CellPosition,
	filter: (r: number, c: number) => boolean
): Set<string> {
	const minR = Math.min(start.row, end.row);
	const maxR = Math.max(start.row, end.row);
	const minC = Math.min(start.col, end.col);
	const maxC = Math.max(start.col, end.col);
	const keys = new Set<string>();
	for (let r = minR; r <= maxR; r++) {
		for (let c = minC; c <= maxC; c++) {
			if (filter(r, c)) keys.add(`${r}-${c}`);
		}
	}
	return keys;
}
