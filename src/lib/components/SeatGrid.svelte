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
	import type { SeatGridState } from '$lib/stores.svelte';

	interface Props {
		/** 座位网格状态实例 */
		grid: SeatGridState;
		/** 当前选中的姓名，点击空单元格时会填入 */
		selectedLine: string;
		/** 姓名从网格移除时的回调 */
		onNameReturn: (name: string) => void;
		/** 姓名填入网格时的回调 */
		onNameFill: (name: string) => void;
	}

	let { grid, selectedLine, onNameReturn, onNameFill }: Props = $props();

	/** 委托给状态类处理单元格点击 */
	function handleCellClick(row: number, col: number) {
		const current = grid.tableData[row][col];
		const isDisabled = grid.disabledCells.has(`${row}-${col}`);
		const isAisle = grid.isAisle(col);

		if (!isAisle && !isDisabled && current) {
			if (grid.swapFirst) {
				if (grid.swapFirst.row === row && grid.swapFirst.col === col) {
					grid.swapFirst = null;
				} else {
					const name1 = grid.tableData[grid.swapFirst.row][grid.swapFirst.col];
					const name2 = current;
					if (name1 && name2) {
						grid.swapCells(grid.swapFirst.row, grid.swapFirst.col, row, col);
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
								onclick={() => handleCellClick(ri, ci)}>过道</td
							>
						{/if}
					{:else}
						<!-- 普通座位: 根据状态动态应用样式 -->
						{@const key = `${ri}-${ci}`}
						{@const isDisabled = grid.disabledCells.has(key)}
						{@const isSwapSelected = grid.swapFirst?.row === ri && grid.swapFirst?.col === ci}
						<td
							/** 已填入姓名 */
							class:filled={cell && !isDisabled}
							/** 已禁用/弃用 */
							class:disabled={isDisabled}
							/** 待清除(第二次点击确认移除姓名) */
							class:confirm={grid.pendingClear.has(key)}
							/** 待禁用(批量操作预览) */
							class:pending-disable={grid.pendingDisable.has(key)}
							/** 待启用(批量恢复预览) */
							class:pending-enable={grid.pendingEnable.has(key)}
							/** 交换选中 */
							class:swap-selected={isSwapSelected}
							onclick={() => handleCellClick(ri, ci)}>{isDisabled ? '弃用' : cell}</td
						>
					{/if}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	/** 表格容器，固定布局使列等宽 */
	.grid {
		border-collapse: separate;
		width: 100%;
		flex: 1;
		border-spacing: 0;
		table-layout: fixed;
	}
	/** 基础单元格样式 */
	.grid td {
		border: 1px solid #ccc;
		background: #fff;
		cursor: pointer;
		text-align: center;
		font-size: 12px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		user-select: none;
		width: 10%;
		height: 10%;
	}
	/* 左上角 */
	.grid tr:first-child td:first-child {
		border-top-left-radius: 8px;
	}
	/* 右上角 */
	.grid tr:first-child td:last-child {
		border-top-right-radius: 8px;
	}
	/* 左下角 */
	.grid tr:last-child td:first-child {
		border-bottom-left-radius: 8px;
	}
	/* 右下角 */
	.grid tr:last-child td:last-child {
		border-bottom-right-radius: 8px;
	}
	/** 已填入姓名的座位: 浅蓝色 */
	.grid td.filled {
		background: #e3f2fd;
	}
	/** 待确认清除: 橙色提示 */
	.grid td.confirm {
		background: #ffe0b2;
	}
	/** 已禁用的座位: 灰色 */
	.grid td.disabled {
		background: #e0e0e0;
		color: #999;
	}
	/** 批量操作预览: 橙色 */
	.grid td.pending-disable,
	.grid td.pending-enable {
		background: #ffe0b2;
	}
	/** 交换选中: 绿色 */
	.grid td.swap-selected {
		background: #a5d6a7;
		box-shadow: inset 0 0 0 2px #4caf50;
	}
	/** 过道列合并单元格: 深灰加粗 */
	.grid td.aisle-cell {
		background: #9e9e9e;
		color: #fff;
		text-align: center;
		font-weight: bold;
		font-size: 14px;
	}
</style>
