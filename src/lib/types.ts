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

/**
 * 表示座位表格中单个单元格的位置
 * 用于跟踪和操作特定的行列坐标
 */
export interface CellPosition {
	/** 行索引 (0-9) */
	row: number;
	/** 列索引 (0-9) */
	col: number;
}

/**
 * 定义座位表格的状态结构
 * 包含所有需要持久化和共享的数据状态
 */
export interface TableState {
	/** 二维数组表示的座位表格数据，空字符串表示空座位 */
	data: string[][];
	/** 被设置为过道的列索引数组 */
	aisleColumns: number[];
	/** 被标记为禁用(弃用)的单元格集合，键格式为"行-列" */
	disabledCells: Set<string>;
}
