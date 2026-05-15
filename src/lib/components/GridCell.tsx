/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createMemo } from 'solid-js';
import { t } from '$lib/i18n';
import type { useSeatGrid } from '$lib/stores/useSeatGrid';

interface Props {
	grid: ReturnType<typeof useSeatGrid>;
	row: number;
	col: number;
	cell: string;
	swappingCells: () => Set<string>;
	onClick: (row: number, col: number) => void;
}

/**
 * 单个座位单元格组件。
 * 根据单元格状态（已填充、禁用、过道、待交换等）动态渲染不同样式与交互。
 */
export default function GridCell(props: Props) {
	const i18n = t;
	const key = () => `${props.row}-${props.col}`;
	const isDisabled = () => props.grid.disabledCells().has(key());
	const isSwapSelected = () =>
		props.grid.swapFirst()?.row === props.row && props.grid.swapFirst()?.col === props.col;

	/** 根据单元格各类状态生成对应的 CSS 类名字符串 */
	const cellClasses = createMemo(() => {
		const list: string[] = [];
		if (props.cell && !isDisabled()) list.push('filled');
		if (isDisabled()) list.push('disabled');
		if (props.grid.pendingClear().has(key())) list.push('confirm');
		if (props.grid.pendingDisable().has(key())) list.push('pending-disable');
		if (props.grid.pendingEnable().has(key())) list.push('pending-enable');
		if (isSwapSelected()) list.push('swap-selected');
		if (props.swappingCells().has(key())) list.push('swapping');
		return list.join(' ');
	});

	/** 过道单元格的样式类，支持待恢复高亮 */
	const aisleClass = createMemo(() =>
		`aisle-cell${props.grid.pendingEnable().has(`0-${props.col}`) ? ' pending-enable' : ''}`
	);

	return (
		<>
			{props.grid.aisleColumns().includes(props.col) ? (
				props.row === 0 ? (
					<td
						class={aisleClass()}
						rowSpan={10}
						onClick={() => props.onClick(props.row, props.col)}
					>
						{i18n().grid.aisle}
					</td>
				) : null
			) : (
				<td class={cellClasses()} onClick={() => props.onClick(props.row, props.col)}>
					{props.cell}
				</td>
			)}
		</>
	);
}
