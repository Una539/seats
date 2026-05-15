/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { ROWS, COLS } from './gridState';
import { createAisleActions } from './aisleOps';
import { createCellMutations } from './cellMutations';
import { createFillCell } from './fillCell';
import { createBatchActions } from './batchOps';
import { createRandomFill } from './randomOps';
import type { CellPosition } from '../types';

/**
 * 座位网格核心 Hook。
 * 管理 10x10 座位表格的状态，包括过道、禁用、交换、批量操作及随机填充逻辑。
 */
export function useSeatGrid() {
	// 核心数据状态
	const [tableData, setTableData] = createStore<string[][]>(
		Array.from({ length: ROWS }, () => Array(COLS).fill(''))
	);
	const [aisleColumns, setAisleColumns] = createSignal<number[]>([]);
	const [disabledCells, setDisabledCells] = createSignal(new Set<string>());

	// 批量操作与交换的暂存状态
	const [pendingDisable, setPendingDisable] = createSignal(new Set<string>());
	const [pendingEnable, setPendingEnable] = createSignal(new Set<string>());
	const [pendingClear, setPendingClear] = createSignal(new Set<string>());
	const [swapFirst, setSwapFirst] = createSignal<CellPosition | null>(null);
	const [batchStart, setBatchStart] = createSignal<CellPosition | null>(null);
	const [batchEnd, setBatchEnd] = createSignal<CellPosition | null>(null);

	// 将所有信号打包，方便分发给子逻辑模块
	const stateBag = {
		tableData,
		setTableData,
		aisleColumns,
		setAisleColumns,
		disabledCells,
		setDisabledCells,
		pendingDisable,
		setPendingDisable,
		pendingEnable,
		setPendingEnable,
		pendingClear,
		setPendingClear,
		swapFirst,
		setSwapFirst,
		batchStart,
		setBatchStart,
		batchEnd,
		setBatchEnd
	};

	// 通过各子模块分别创建不同领域的操作函数
	const batchActions = createBatchActions(stateBag);
	const aisleActions = createAisleActions(stateBag);
	const cellMutations = createCellMutations(stateBag);
	const fillActions = createFillCell({
		...stateBag,
		...aisleActions,
		resetBatch: batchActions.resetBatch
	});
	const randomActions = createRandomFill({
		tableData,
		setTableData,
		isAisle: aisleActions.isAisle,
		isDisabled: cellMutations.isDisabled,
		resetBatch: batchActions.resetBatch
	});

	// 将所有状态与操作函数聚合后暴露
	return {
		...stateBag,
		...batchActions,
		...aisleActions,
		...cellMutations,
		...fillActions,
		...randomActions
	};
}
