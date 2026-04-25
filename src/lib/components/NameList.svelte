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
  名单列表组件
  显示当前待分配的姓名列表
  用户点击姓名后将其标记为"选中"状态
  之后点击网格中的空单元格即可填入该姓名
-->

<script lang="ts">
	interface Props {
		/** 待分配的姓名数组 */
		lines: string[];
		/** 当前选中的姓名 */
		selectedLine: string;
		/** 用户点击某行时的回调 */
		onSelect: (line: string) => void;
	}

	let { lines, selectedLine, onSelect }: Props = $props();
</script>

<!-- 仅在有名单数据时显示 -->
{#if lines.length > 0}
	<div class="lines">
		{#each lines as line (line)}
			<button class:selected={selectedLine === line} onclick={() => onSelect(line)}>
				{line}
			</button>
		{/each}
	</div>
{/if}

<style>
	/** 名单容器，垂直滚动列表 */
	.lines {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		overflow-y: auto;
	}
	/** 名单项按钮 */
	.lines button {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		background: #fff;
		cursor: pointer;
		text-align: left;
		font-size: 14px;
		user-select: none;
	}
	/** 当前选中的名单项: 蓝色高亮 */
	.lines button.selected {
		background: #1976d2;
		color: #fff;
		border-color: #1565c0;
	}
</style>
