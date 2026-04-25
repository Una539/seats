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
	<div class="list">
		{#each lines as line (line)}
			<button class:selected={selectedLine === line} onclick={() => onSelect(line)}>
				{line}
			</button>
		{/each}
	</div>
{/if}

<style>
	/* ── 列表容器 ───────────────────────────── */
	.list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		overflow-y: auto;
		/* 自定义滚动条 */
		scrollbar-width: thin;
		scrollbar-color: var(--border-strong) transparent;
	}

	.list::-webkit-scrollbar {
		width: 4px;
	}
	.list::-webkit-scrollbar-track {
		background: transparent;
	}
	.list::-webkit-scrollbar-thumb {
		background: var(--border-strong);
		border-radius: 2px;
	}

	/* ── 名单项 ─────────────────────────────── */
	.list button {
		padding: 5px 8px;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		cursor: pointer;
		text-align: left;
		font-size: 12px;
		font-family: var(--font-mono);
		color: var(--text-primary);
		user-select: none;
		line-height: 1.5;
		transition:
			background var(--duration) var(--ease-out),
			border-color var(--duration) var(--ease-out),
			color var(--duration) var(--ease-out);
	}

	.list button:hover {
		background: var(--surface-active);
		border-color: var(--border);
	}

	/* 选中状态 — 深色实底 */
	.list button.selected {
		background: var(--text-primary);
		border-color: var(--text-primary);
		color: #ffffff;
	}
</style>
