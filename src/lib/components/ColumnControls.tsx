/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { t } from '$lib/i18n';
import type { useSeatGrid } from '$lib/stores/useSeatGrid';

interface Props {
	grid: ReturnType<typeof useSeatGrid>;
	onDisplace: (names: string[]) => void;
}

/**
 * 列控制按钮栏。
 * 显示在网格上方，用于将整列切换为过道或恢复为座位。
 */
export default function ColumnControls(props: Props) {
	const i18n = t;

	/** 点击列按钮时切换过道状态，并将被挤出的学生归还名单 */
	function handleToggle(ci: number) {
		const displaced = props.grid.toggleAisle(ci);
		if (displaced.length > 0) props.onDisplace(displaced);
	}

	return (
		<div class="column-controls">
			{Array.from({ length: 10 }, (_, ci) => (
				<button
					class={props.grid.aisleColumns().includes(ci) ? 'aisle' : ''}
					onClick={() => handleToggle(ci)}
				>
					<span class="col-num">{ci + 1}</span>
					<span
						class={`col-label${props.grid.aisleColumns().includes(ci) ? ' visible' : ''}`}
					>
						{i18n().grid.aisle}
					</span>
				</button>
			))}
		</div>
	);
}
