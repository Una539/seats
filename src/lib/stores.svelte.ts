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

import { SvelteSet } from 'svelte/reactivity';
import type { CellPosition } from './types';

/**
 * 座位网格状态管理类
 * 封装所有与座位表格相关的状态和操作逻辑
 * 使用 Svelte 5 的 $state 和 SvelteSet 实现响应式更新
 */
export class SeatGridState {
	/** 10x10 座位表格数据，空字符串表示空座位 */
	tableData: string[][] = $state(Array.from({ length: 10 }, () => Array(10).fill('')));
	/** 被设置为过道的列索引数组 */
	aisleColumns: number[] = $state([]);
	/** 被标记为禁用(弃用)的单元格集合 */
	disabledCells = new SvelteSet<string>();

	/** 待禁用的单元格集合（批量操作时用于预览和确认） */
	pendingDisable = new SvelteSet<string>();
	/** 待启用的单元格集合（用于恢复已禁用座位时的预览和确认） */
	pendingEnable = new SvelteSet<string>();
	/** 待清除的单元格集合（用于移除已填入姓名时的预览和确认） */
	pendingClear = new SvelteSet<string>();
	/** 第一个选中的座位用于交换 */
	swapFirst: { row: number; col: number } | null = $state(null);

	/** 批量操作的起始位置 */
	batchStart: CellPosition | null = $state(null);
	/** 批量操作的结束位置 */
	batchEnd: CellPosition | null = $state(null);

	/**
	 * 重置所有批量操作相关的状态
	 * 清除待操作集合和批次起止位置
	 */
	resetBatch() {
		this.pendingDisable.clear();
		this.pendingEnable.clear();
		this.batchStart = null;
		this.batchEnd = null;
	}

	/**
	 * 检查指定列是否为过道
	 */
	isAisle(col: number): boolean {
		return this.aisleColumns.includes(col);
	}

	/**
	 * 检查指定单元格是否为禁用状态
	 */
	isDisabled(row: number, col: number): boolean {
		return this.disabledCells.has(`${row}-${col}`);
	}

	/**
	 * 切换指定列的过道状态
	 * 设置为过道时会清空该列所有数据和禁用状态
	 * 取消过道时仅从数组中移除该列索引
	 */
	toggleAisle(col: number) {
		if (this.isAisle(col)) {
			this.aisleColumns = this.aisleColumns.filter((c) => c !== col);
			for (let row = 0; row < 10; row++) {
				this.tableData[row][col] = '';
				this.disabledCells.delete(`${row}-${col}`);
			}
		} else {
			this.aisleColumns = [...this.aisleColumns, col];
		}
	}

	/**
	 * 处理单元格点击的核心逻辑
	 * 根据单元格当前状态和用户选择实现不同的交互行为:
	 * - 过道列: 两次点击可取消过道设置
	 * - 已禁用单元格: 批量操作时可恢复启用
	 * - 已有姓名的单元格: 两次点击可移除姓名并返回名单
	 * - 空单元格且有选中姓名: 填入姓名
	 * - 空单元格且无选中姓名: 批量操作时可标记为禁用
	 *
	 * @param row - 行索引
	 * @param col - 列索引
	 * @param selectedLine - 当前从右侧名单选中的姓名
	 * @param onNameReturn - 姓名被移除时的回调，用于将姓名返回到名单
	 * @param onNameFilled - 姓名被填入时的回调，用于从名单中删除姓名
	 */
	fillCell(
		row: number,
		col: number,
		selectedLine: string,
		onNameReturn: (name: string) => void,
		onNameFilled?: (name: string) => void
	) {
		const key = `${row}-${col}`;
		const isAisle = this.isAisle(col);
		const isDisabled = this.isDisabled(row, col);
		const current = this.tableData[row][col];

		// 禁止在过道或禁用单元格上填入姓名
		if (selectedLine && (isAisle || isDisabled)) {
			alert('不能在被弃用或过道的座位上操作');
			return;
		}

		// 处理过道列点击
		if (isAisle) {
			if (this.pendingEnable.has(key)) {
				// 第二次点击确认: 取消过道
				this.toggleAisle(col);
				this.pendingEnable.clear();
			} else {
				// 第一次点击: 加入待启用预览
				this.resetBatch();
				this.pendingEnable.add(key);
			}
		}
		// 处理已禁用单元格点击
		else if (isDisabled) {
			const isConfirm =
				this.pendingEnable.has(key) ||
				(this.batchEnd && this.batchEnd.row === row && this.batchEnd.col === col);
			if (isConfirm && this.pendingEnable.size > 0) {
				// 第二次点击确认: 批量恢复启用
				for (const k of this.pendingEnable) this.disabledCells.delete(k);
				this.pendingEnable.clear();
				this.batchStart = null;
				this.batchEnd = null;
			} else if (this.batchStart) {
				// 计算矩形区域内的所有禁用单元格
				const minRow = Math.min(this.batchStart.row, row);
				const maxRow = Math.max(this.batchStart.row, row);
				const minCol = Math.min(this.batchStart.col, col);
				const maxCol = Math.max(this.batchStart.col, col);
				this.pendingEnable.clear();
				for (let r = minRow; r <= maxRow; r++) {
					for (let c = minCol; c <= maxCol; c++) {
						const k = `${r}-${c}`;
						if (this.disabledCells.has(k)) this.pendingEnable.add(k);
					}
				}
				this.batchStart = null;
				this.batchEnd = { row, col };
			} else {
				// 第一次点击: 开始批量恢复
				this.resetBatch();
				this.batchStart = { row, col };
				this.pendingEnable.add(key);
			}
		}
		// 处理已有姓名的单元格点击
		else if (current) {
			if (this.pendingClear.has(key)) {
				// 第二次点击确认: 移除姓名并返回名单
				this.tableData[row][col] = '';
				onNameReturn(current);
				this.pendingClear.delete(key);
			} else {
				// 第一次点击: 加入待清除预览
				this.pendingClear.clear();
				this.pendingClear.add(key);
			}
		}
		// 处理空单元格填入姓名
		else if (selectedLine) {
			this.tableData[row][col] = selectedLine;
			onNameFilled?.(selectedLine);
			this.resetBatch();
		}
		// 处理空单元格批量禁用
		else {
			const isConfirm =
				this.pendingDisable.has(key) ||
				(this.batchEnd && this.batchEnd.row === row && this.batchEnd.col === col);
			if (isConfirm && this.pendingDisable.size > 0) {
				// 第二次点击确认: 批量禁用
				for (const k of this.pendingDisable) this.disabledCells.add(k);
				this.pendingDisable.clear();
				this.batchStart = null;
				this.batchEnd = null;
			} else if (this.batchStart) {
				// 计算矩形区域内的所有可用空单元格
				const minRow = Math.min(this.batchStart.row, row);
				const maxRow = Math.max(this.batchStart.row, row);
				const minCol = Math.min(this.batchStart.col, col);
				const maxCol = Math.max(this.batchStart.col, col);
				this.pendingDisable.clear();
				for (let r = minRow; r <= maxRow; r++) {
					for (let c = minCol; c <= maxCol; c++) {
						const k = `${r}-${c}`;
						if (!this.disabledCells.has(k) && !this.isAisle(c) && !this.tableData[r][c]) {
							this.pendingDisable.add(k);
						}
					}
				}
				this.batchStart = null;
				this.batchEnd = { row, col };
			} else {
				// 第一次点击: 开始批量禁用
				this.resetBatch();
				this.batchStart = { row, col };
				this.pendingDisable.add(key);
			}
		}
	}

	/**
	 * 获取所有可用的空白单元格位置
	 * 排除过道列、禁用单元格和已有姓名的单元格
	 */
	getAvailableCells(): CellPosition[] {
		const available: CellPosition[] = [];
		for (let r = 0; r < this.tableData.length; r++) {
			for (let c = 0; c < this.tableData[r].length; c++) {
				if (this.isAisle(c)) continue;
				if (this.isDisabled(r, c)) continue;
				if (this.tableData[r][c]) continue;
				available.push({ row: r, col: c });
			}
		}
		return available;
	}

	/**
	 * 将名单中的姓名随机填入可用单元格
	 * 同时打乱可用单元格顺序和名单顺序以确保随机性
	 *
	 * @param lines - 待填入的姓名字符串数组
	 * @param onLinesUpdate - 名单更新回调
	 */
	randomFill(lines: string[], onLinesUpdate: (newLines: string[]) => void) {
		const available = this.getAvailableCells();

		// 检查可用单元格数量是否足够
		if (lines.length > available.length) {
			alert(
				`名单人数（${lines.length}）超过可用空白单元格数（${available.length}），无法完成随机填入。`
			);
			return;
		}

		// 使用 Fisher-Yates 算法打乱可用单元格
		for (let i = available.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[available[i], available[j]] = [available[j], available[i]];
		}

		// 打乱名单顺序
		const namesToFill = [...lines];
		for (let i = namesToFill.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[namesToFill[i], namesToFill[j]] = [namesToFill[j], namesToFill[i]];
		}

		// 将打乱后的姓名填入打乱后的位置
		for (let i = 0; i < namesToFill.length; i++) {
			const { row, col } = available[i];
			this.tableData[row][col] = namesToFill[i];
		}
		onLinesUpdate([]);
		this.resetBatch();
	}

	/**
	 * 清除单个单元格的内容
	 * 主要用于程序化调用，区别于用户交互的 fillCell
	 *
	 * @param row - 行索引
	 * @param col - 列索引
	 * @param onNameReturn - 姓名返回回调
	 */
	clearCell(row: number, col: number, onNameReturn: (name: string) => void) {
		const name = this.tableData[row][col];
		if (name) {
			this.tableData[row][col] = '';
			onNameReturn(name);
		}
	}

	/**
	 * 交换两个座位的姓名
	 *
	 * @param row1 - 第一个座位行索引
	 * @param col1 - 第一个座位列索引
	 * @param row2 - 第二个座位行索引
	 * @param col2 - 第二个座位列索引
	 */
	swapCells(row1: number, col1: number, row2: number, col2: number) {
		const name1 = this.tableData[row1][col1];
		const name2 = this.tableData[row2][col2];
		if (!name1 || !name2) return;

		this.tableData[row1][col1] = name2;
		this.tableData[row2][col2] = name1;
		this.swapFirst = null;
	}
}
