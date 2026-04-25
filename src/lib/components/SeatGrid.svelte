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
  座位网格组件
  渲染 10x10 的座位表格
  根据单元格状态应用不同的 CSS 类
  处理用户点击交互，委托给 SeatGridState 处理具体逻辑
-->

<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type { SeatGridState } from '$lib/stores.svelte';
	import { localeStore, translations } from '$lib/i18n/index.svelte';

	/** 正在播放交换动画的单元格 key 集合 */
	const swappingCells = new SvelteSet<string>();

	interface Props {
		/** 座位网格状态实例 */
		grid: SeatGridState;
		/** 当前操作模式：fill = 填入/交换，remove = 移除学生 */
		mode: 'fill' | 'remove';
		/** 当前选中的姓名，点击空单元格时会填入 */
		selectedLine: string;
		/** 姓名从网格移除时的回调 */
		onNameReturn: (name: string) => void;
		/** 姓名填入网格时的回调 */
		onNameFill: (name: string) => void;
	}

	let { grid, mode, selectedLine, onNameReturn, onNameFill }: Props = $props();

	const i18n = $derived(translations[localeStore.locale]);

	/** 委托给状态类处理单元格点击 */
	function handleCellClick(row: number, col: number) {
		const current = grid.tableData[row][col];
		const isDisabled = grid.disabledCells.has(`${row}-${col}`);
		const isAisle = grid.isAisle(col);

		// ── 移除模式 ──────────────────────────────────────────
		if (mode === 'remove') {
			if (!isAisle && !isDisabled && current) {
				const key = `${row}-${col}`;
				if (grid.pendingClear.has(key)) {
					grid.tableData[row][col] = '';
					onNameReturn(current);
					grid.pendingClear.clear();
				} else {
					grid.pendingClear.clear();
					grid.pendingClear.add(key);
				}
			} else {
				grid.pendingClear.clear();
			}
			return;
		}

		// ── 填座模式（默认） ──────────────────────────────────
		if (!isAisle && !isDisabled && current) {
			if (grid.swapFirst) {
				if (grid.swapFirst.row === row && grid.swapFirst.col === col) {
					grid.swapFirst = null;
				} else {
					const name1 = grid.tableData[grid.swapFirst.row][grid.swapFirst.col];
					const name2 = current;
					if (name1 && name2) {
						// 先记录两个 key，swapCells 会将 swapFirst 置 null
						const key1 = `${grid.swapFirst.row}-${grid.swapFirst.col}`;
						const key2 = `${row}-${col}`;
						grid.swapCells(grid.swapFirst.row, grid.swapFirst.col, row, col);
						// 触发动画
						swappingCells.add(key1);
						swappingCells.add(key2);
						setTimeout(() => {
							swappingCells.delete(key1);
							swappingCells.delete(key2);
						}, 500);
					} else {
						grid.swapFirst = null;
					}
				}
			} else {
				grid.swapFirst = { row, col };
			}
		} else {
			grid.swapFirst = null;
			grid.fillCell(row, col, selectedLine, onNameReturn, onNameFill);
		}
	}
</script>

<table class="grid">
	<tbody>
		<!-- 遍历行数据 -->
		{#each grid.tableData as row, ri (ri)}
			<tr>
				<!-- 遍历列数据 -->
				{#each row as cell, ci (ci)}
					<!-- 过道列: 使用 rowspan 合并为单单元格 -->
					{#if grid.isAisle(ci)}
						{#if ri === 0}
							<td
								class="aisle-cell"
								class:pending-enable={grid.pendingEnable.has(`0-${ci}`)}
								rowspan={10}
								onclick={() => handleCellClick(ri, ci)}>{i18n.grid.aisle}</td
							>
						{/if}
					{:else}
						<!-- 普通座位: 根据状态动态应用样式 -->
						{@const key = `${ri}-${ci}`}
						{@const isDisabled = grid.disabledCells.has(key)}
						{@const isSwapSelected = grid.swapFirst?.row === ri && grid.swapFirst?.col === ci}
						<td
							class:filled={cell && !isDisabled}
							class:disabled={isDisabled}
							class:confirm={grid.pendingClear.has(key)}
							class:pending-disable={grid.pendingDisable.has(key)}
							class:pending-enable={grid.pendingEnable.has(key)}
							class:swap-selected={isSwapSelected}
							class:swapping={swappingCells.has(key)}
							onclick={() => handleCellClick(ri, ci)}>{cell}</td
						>
					{/if}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	/* ── 表格容器 ───────────────────────────────── */
	.grid {
		border-collapse: separate;
		border-spacing: 0;
		width: 100%;
		flex: 1;
		table-layout: fixed;
	}

	/* ── 基础单元格 ─────────────────────────────── */
	.grid td {
		border-right: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
		border-top: none;
		border-left: none;
		background: var(--surface);
		cursor: pointer;
		text-align: center;
		font-size: 11px;
		font-family: var(--font-mono);
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		user-select: none;
		width: 10%;
		height: 10%;
		transition:
			background var(--duration) var(--ease-out),
			color var(--duration) var(--ease-out);
	}

	/* 首行加顶部边框 */
	.grid tr:first-child td {
		border-top: 1px solid var(--border);
	}
	/* 首列加左边框 */
	.grid td:first-child {
		border-left: 1px solid var(--border);
	}

	/* 圆角 — 四个表格角 */
	.grid tr:first-child td:first-child {
		border-top-left-radius: var(--radius-sm);
	}
	.grid tr:first-child td:last-child {
		border-top-right-radius: var(--radius-sm);
	}
	.grid tr:last-child td:first-child {
		border-bottom-left-radius: var(--radius-sm);
	}
	.grid tr:last-child td:last-child {
		border-bottom-right-radius: var(--radius-sm);
	}

	/* ── 状态变体 ───────────────────────────────── */

	/** 已填入姓名 */
	.grid td.filled {
		background: var(--accent-subtle);
		color: var(--text-primary);
	}

	/** 待确认清除（移除模式下点击后高亮，再次点击确认） */
	.grid td.confirm {
		background: #fef3f3;
		border-color: #fbdada;
		color: #eb5757;
	}

	/** 已禁用（视觉弱化，无文字标记） */
	.grid td.disabled {
		background: var(--surface-active);
		color: var(--text-muted);
		cursor: default;
		/* 降低对比度以表明不可用 */
		opacity: 0.55;
	}

	/** 批量操作预览 */
	.grid td.pending-disable,
	.grid td.pending-enable {
		background: var(--amber-subtle);
		border-color: var(--amber-border);
	}

	/** 交换选中 — 用内嵌边框突出，不改底色 */
	.grid td.swap-selected {
		background: var(--accent-subtle);
		box-shadow: inset 0 0 0 2px var(--accent);
	}

	/** 交换完成闪光动画 — 用大扩散 inset shadow 叠色，不改变布局 */
	@keyframes swap-flash {
		0% {
			box-shadow: inset 0 0 0 100vw rgba(35, 131, 226, 0.22);
		}
		100% {
			box-shadow: inset 0 0 0 100vw rgba(35, 131, 226, 0);
		}
	}

	.grid td.swapping {
		animation: swap-flash 500ms var(--ease-out) forwards;
	}

	/** 过道合并列 */
	.grid td.aisle-cell {
		background: var(--surface-active);
		color: var(--text-muted);
		text-align: center;
		font-size: 10px;
		font-family: var(--font-sans);
		font-weight: 500;
		letter-spacing: 0.04em;
		cursor: pointer;
		border-left: 1px solid var(--border);
	}
</style>
