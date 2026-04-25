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
	}

	let { grid }: Props = $props();
</script>

<!-- 10 列的控制按钮，显示列号并标记过道状态 -->
<div class="column-controls">
	{#each Array(10), ci (ci)}
		<button class:aisle={grid.isAisle(ci)} onclick={() => grid.toggleAisle(ci)}>
			{ci + 1}
			{#if grid.isAisle(ci)}
				过道
			{/if}
		</button>
	{/each}
</div>

<style>
	/** 按钮网格容器，10 列等宽分布 */
	.column-controls {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		gap: 0;
		margin-bottom: 0.5rem;
	}
	/* 1. 左上角：第一个元素 */
	.column-controls > :first-child {
		border-top-left-radius: 8px;
	}

	/* 2. 右上角：第 10 个元素（第一行的末尾） */
	.column-controls > :nth-child(10) {
		border-top-right-radius: 8px;
	}

	/* 3. 左下角：假设只有一行，则是第一个；若有多行，需定位最后一行首位 */
	/* 如果不确定行数，可以用 :nth-last-child 来倒序定位 */
	.column-controls > :nth-last-child(10) {
		border-bottom-left-radius: 8px;
	}

	/* 4. 右下角：最后一个元素 */
	.column-controls > :last-child {
		border-bottom-right-radius: 8px;
	}
	.column-controls button {
		padding: 0.3rem;
		border: 1px solid #ccc;
		background: #fff;
		cursor: pointer;
		font-size: 12px;
		text-align: center;
		user-select: none;
	}
	/** 被设置为过道的列按钮样式 */
	.column-controls button.aisle {
		background: #9e9e9e;
		color: #fff;
		border-color: #757575;
	}
</style>
