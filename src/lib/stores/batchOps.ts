/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import type { CellPosition } from '../types';

/** 批量操作所需的依赖接口 */
export interface BatchDeps {
	setPendingDisable: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
	setPendingEnable: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
	setPendingClear: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
	setBatchStart: (v: CellPosition | null) => void;
	setBatchEnd: (v: CellPosition | null) => void;
}

/** 创建批量操作辅助函数，用于一键重置所有批量选中状态 */
export function createBatchActions(deps: BatchDeps) {
	/** 清空所有待处理的批量操作状态（禁用、启用、清除） */
	function resetBatch() {
		deps.setPendingDisable(new Set());
		deps.setPendingEnable(new Set());
		deps.setPendingClear(new Set());
		deps.setBatchStart(null);
		deps.setBatchEnd(null);
	}

	return { resetBatch };
}
