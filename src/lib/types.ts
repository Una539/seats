/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

/** 座位表格中单个单元格的行号与列号 */
export interface CellPosition {
	row: number;
	col: number;
}

/** 座位表格的完整状态结构 */
export interface TableState {
	/** 二维数组，存储每个座位上的姓名（空字符串表示空座位） */
	data: string[][];
	/** 被设为过道的列索引列表 */
	aisleColumns: number[];
	/** 被禁用的座位键值集合，格式为 "row-col" */
	disabledCells: Set<string>;
}
