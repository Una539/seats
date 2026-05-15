/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { getRectKeys } from './rectUtils';
import type { CellPosition } from '../types';

/** 填充单元格操作所需的依赖接口 */
export interface FillDeps {
	tableData: string[][];
	setTableData: (row: number, col: number, value: string) => void;
	disabledCells: () => Set<string>;
	setDisabledCells: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
	pendingDisable: () => Set<string>;
	setPendingDisable: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
	pendingEnable: () => Set<string>;
	setPendingEnable: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
	pendingClear: () => Set<string>;
	setPendingClear: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
	batchStart: () => CellPosition | null;
	setBatchStart: (v: CellPosition | null) => void;
	batchEnd: () => CellPosition | null;
	setBatchEnd: (v: CellPosition | null) => void;
	isAisle: (col: number) => boolean;
	resetBatch: () => void;
	toggleAisle?: (col: number) => string[];
}

/**
 * 创建单元格填充逻辑。
 * 根据当前单元格状态（过道/禁用/已填充/空）和用户操作（单击/批量框选）执行不同行为：
 * - 空单元格 → 填入选中姓名
 * - 已填充单元格 → 触发交换或清除
 * - 过道/禁用单元格 → 批量框选或恢复
 */
export function createFillCell(deps: FillDeps) {
	/** 批量更新 disabledCells 集合，支持添加或删除键值 */
	function applyDisabledUpdates(keys: Iterable<string>, action: 'add' | 'delete') {
		for (const k of keys) {
			deps.setDisabledCells((prev) => {
				const n = new Set(prev);
				if (action === 'add') n.add(k);
				else n.delete(k);
				return n;
			});
		}
	}

	/**
	 * 处理单元格点击事件，根据单元格当前状态和用户模式执行对应操作。
	 */
	function fillCell(
		row: number,
		col: number,
		selectedLine: string,
		onNameReturn: (name: string) => void,
		onNameFilled?: (name: string) => void
	) {
		const key = `${row}-${col}`;
		const aisle = deps.isAisle(col);
		const disabled = deps.disabledCells().has(key);
		const current = deps.tableData[row][col];

		// 若已选中姓名，则禁止在过道或禁用座位上操作
		if (selectedLine && (aisle || disabled)) {
			alert('不能在被弃用或过道的座位上操作');
			return;
		}

		// 点击过道列：第一次点击标记待恢复，第二次点击确认并取消过道
		if (aisle) {
			if (deps.pendingEnable().has(key)) {
				deps.toggleAisle?.(col);
				deps.setPendingEnable(new Set());
			} else {
				deps.resetBatch();
				deps.setPendingEnable(new Set([key]));
			}
			return;
		}

		// 点击已禁用单元格：支持单格恢复或批量框选恢复
		if (disabled) {
			const isConfirm =
				deps.pendingEnable().has(key) ||
				(deps.batchEnd()?.row === row && deps.batchEnd()?.col === col);
			if (isConfirm && deps.pendingEnable().size > 0) {
				// 确认恢复：将 pendingEnable 中所有单元格解除禁用
				applyDisabledUpdates(deps.pendingEnable(), 'delete');
				deps.setPendingEnable(new Set());
				deps.setBatchStart(null);
				deps.setBatchEnd(null);
			} else if (deps.batchStart()) {
				// 框选模式：由 batchStart 与当前点围成矩形，收集所有禁用单元格
				const rect = getRectKeys(deps.batchStart()!, { row, col }, (r, c) =>
					deps.disabledCells().has(`${r}-${c}`)
				);
				deps.setPendingEnable(rect);
				deps.setBatchStart(null);
				deps.setBatchEnd({ row, col });
			} else {
				// 首次点击：标记该单元格为待恢复，并设为框选起点
				deps.resetBatch();
				deps.setBatchStart({ row, col });
				deps.setPendingEnable(new Set([key]));
			}
			return;
		}

		// 点击已填充单元格：第一次点击标记待清除，第二次点击确认并清空
		if (current) {
			if (deps.pendingClear().has(key)) {
				deps.setTableData(row, col, '');
				onNameReturn(current);
				deps.setPendingClear(new Set());
			} else {
				deps.setPendingClear(new Set([key]));
			}
			return;
		}

		// 点击空单元格且有选中姓名：直接填入姓名
		if (selectedLine) {
			deps.setTableData(row, col, selectedLine);
			onNameFilled?.(selectedLine);
			deps.resetBatch();
			return;
		}

		// 点击空单元格且无选中姓名：支持单格禁用或批量框选禁用
		const isConfirm =
			deps.pendingDisable().has(key) ||
			(deps.batchEnd()?.row === row && deps.batchEnd()?.col === col);
		if (isConfirm && deps.pendingDisable().size > 0) {
			// 确认禁用：将 pendingDisable 中所有单元格设为禁用
			applyDisabledUpdates(deps.pendingDisable(), 'add');
			deps.setPendingDisable(new Set());
			deps.setBatchStart(null);
			deps.setBatchEnd(null);
		} else if (deps.batchStart()) {
			// 框选模式：收集矩形区域内所有空且非过道的单元格
			const rect = getRectKeys(deps.batchStart()!, { row, col }, (r, c) => {
				const k = `${r}-${c}`;
				return !deps.disabledCells().has(k) && !deps.isAisle(c) && !deps.tableData[r][c];
			});
			deps.setPendingDisable(rect);
			deps.setBatchStart(null);
			deps.setBatchEnd({ row, col });
		} else {
			// 首次点击：标记该单元格为待禁用，并设为框选起点
			deps.resetBatch();
			deps.setBatchStart({ row, col });
			deps.setPendingDisable(new Set([key]));
		}
	}

	return { fillCell };
}
