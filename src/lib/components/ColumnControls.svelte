<!--
  Copyright (C) 2026 Una

  This file is part of seats.

  seats is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  seats is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with seats. If not, see <https://www.gnu.org/licenses/>.
-->

<!--
  列控制组件
  在座位网格上方显示 10 个列按钮
  点击可切换对应列的"过道"状态
  设置为过道的列不能被填入姓名
-->

<script lang="ts">
	import type { SeatGridState } from '$lib/stores.svelte';

	interface Props {
		grid: SeatGridState;
		/** 有学生被设为过道清退时的回调，参数为被清退的姓名数组 */
		onDisplace: (names: string[]) => void;
	}

	let { grid, onDisplace }: Props = $props();

	function handleToggle(ci: number) {
		const displaced = grid.toggleAisle(ci);
		if (displaced.length > 0) onDisplace(displaced);
	}
</script>

<!-- 10 列的控制按钮，显示列号并标记过道状态 -->
<div class="column-controls">
	{#each Array(10), ci (ci)}
		<button class:aisle={grid.isAisle(ci)} onclick={() => handleToggle(ci)}>
			<span class="col-num">{ci + 1}</span>
			<span class="col-label" class:visible={grid.isAisle(ci)}>过道</span>
		</button>
	{/each}
</div>

<style>
	.column-controls {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		gap: 0;
		margin-bottom: 6px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.column-controls button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4px 2px;
		border: none;
		border-right: 1px solid var(--border);
		background: var(--surface);
		cursor: pointer;
		user-select: none;
		color: var(--text-secondary);
		gap: 1px;
		transition:
			background var(--duration) var(--ease-out),
			color var(--duration) var(--ease-out);
	}

	.column-controls button:last-child {
		border-right: none;
	}

	.column-controls button:hover {
		background: var(--surface-hover);
	}

	.col-num {
		font-size: 11px;
		font-family: var(--font-mono);
		font-weight: 500;
		color: var(--text-secondary);
		line-height: 1;
	}

	.col-label {
		font-size: 9px;
		font-family: var(--font-sans);
		color: var(--text-muted);
		line-height: 1;
		visibility: hidden;
	}

	.col-label.visible {
		visibility: visible;
	}

	/** 已设置为过道的列按钮 */
	.column-controls button.aisle {
		background: var(--text-primary);
		border-right-color: #555;
	}

	.column-controls button.aisle .col-num,
	.column-controls button.aisle .col-label {
		color: rgba(255, 255, 255, 0.85);
	}

	.column-controls button.aisle:hover {
		background: #2a2924;
	}
</style>
