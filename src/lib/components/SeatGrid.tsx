/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal, For } from 'solid-js';
import type { useSeatGrid } from '$lib/stores/useSeatGrid';
import GridCell from './GridCell';

interface Props {
	grid: ReturnType<typeof useSeatGrid>;
	mode: () => 'fill' | 'remove';
	selectedLine: () => string;
	onNameReturn: (name: string) => void;
	onNameFill: (name: string) => void;
}

/**
 * 座位网格主组件。
 * 渲染 10x10 的座位表格，处理单元格点击事件：
 * - remove 模式下确认后清空座位并归还姓名
 * - fill 模式下支持姓名分配、交换两个座位、批量禁用/启用
 */
export default function SeatGrid(props: Props) {
	/** 记录当前正在执行交换动画的单元格键值集合 */
	const [swappingCells, setSwappingCells] = createSignal(new Set<string>());

	/** 处理单元格点击，根据当前模式执行不同逻辑 */
	function handleCellClick(row: number, col: number) {
		const grid = props.grid;
		const current = grid.tableData[row][col];
		const isDisabled = grid.disabledCells().has(`${row}-${col}`);
		const isAisle = grid.isAisle(col);

		// 移除模式：点击已填充单元格触发待清除，再次点击确认移除
		if (props.mode() === 'remove') {
			if (!isAisle && !isDisabled && current) {
				const key = `${row}-${col}`;
				if (grid.pendingClear().has(key)) {
					grid.setTableData(row, col, '');
					props.onNameReturn(current);
					grid.setPendingClear(new Set<string>());
				} else {
					grid.setPendingClear(new Set([key]));
				}
			} else {
				grid.setPendingClear(new Set<string>());
			}
			return;
		}

		// 填座模式：点击已填充单元格触发交换逻辑
		if (!isAisle && !isDisabled && current) {
			if (grid.swapFirst()) {
				const first = grid.swapFirst()!;
				// 再次点击同一单元格则取消交换选择
				if (first.row === row && first.col === col) {
					grid.setSwapFirst(null);
				} else {
					// 与另一个已填充单元格交换内容，并触发短暂动画
					const name1 = grid.tableData[first.row][first.col];
					const name2 = current;
					if (name1 && name2) {
						const key1 = `${first.row}-${first.col}`;
						const key2 = `${row}-${col}`;
						grid.swapCells(first.row, first.col, row, col);
						setSwappingCells((prev: Set<string>) => new Set([...prev, key1, key2]));
						setTimeout(() => {
							setSwappingCells((prev: Set<string>) => {
								const next = new Set(prev);
								next.delete(key1);
								next.delete(key2);
								return next;
							});
						}, 500);
					} else {
						grid.setSwapFirst(null);
					}
				}
			} else {
				// 首次点击已填充单元格，标记为交换起点
				grid.setSwapFirst({ row, col });
			}
		} else {
			// 点击空/禁用/过道单元格：走 fillCell 逻辑（分配姓名或批量操作）
			grid.setSwapFirst(null);
			grid.fillCell(row, col, props.selectedLine(), props.onNameReturn, props.onNameFill);
		}
	}

	return (
		<table class="grid">
			<tbody>
				<For each={props.grid.tableData}>
					{(row: string[], ri) => (
						<tr>
							<For each={row}>
								{(cell: string, ci) => (
									<GridCell
										grid={props.grid}
										row={ri()}
										col={ci()}
										cell={cell}
										swappingCells={swappingCells}
										onClick={handleCellClick}
									/>
								)}
							</For>
						</tr>
					)}
				</For>
			</tbody>
		</table>
	);
}
