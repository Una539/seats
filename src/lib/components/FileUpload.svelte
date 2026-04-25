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
  文件上传与操作组件
  提供上传 .txt 名单文件的功能
  显示当前加载的文件信息和行数统计
  包含"随机填入"按钮用于一键分配座位
-->

<script lang="ts">
	interface Props {
		/** 当前加载的文件名 */
		fileName: string;
		/** 名单中的行数 */
		lineCount: number;
		/** 错误信息 */
		error: string;
		/** 文件上传时的回调 */
		onFileUpload: (event: Event) => void;
		/** 随机填入按钮点击时的回调 */
		onRandomFill: () => void;
		/** 导出 xlsx 按钮点击时的回调 */
		onExport: () => void;
	}

	let { fileName, lineCount, error, onFileUpload, onRandomFill, onExport }: Props = $props();
</script>

<div class="actions">
	<!-- 文件上传 -->
	<label class="btn btn-ghost">
		<span>浏览文件</span>
		<input type="file" accept=".txt" style="display: none;" onchange={onFileUpload} />
	</label>

	<!-- 随机填入 — 主操作，深色实底 -->
	<button class="btn btn-primary" onclick={onRandomFill}>随机填入</button>

	<!-- 导出 -->
	<button class="btn btn-mid" onclick={onExport}>导出 XLSX</button>

	<!-- 文件信息 -->
	{#if fileName}
		<p class="meta">
			<span class="meta-label">待分配</span>
			<span class="meta-value">{lineCount}</span>
		</p>
	{/if}

	<!-- 错误信息 -->
	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>

<style>
	.actions {
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex-shrink: 0;
	}

	/* ── 基础按钮 ─────────────────────────────── */
	.btn {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 6px 10px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: 12px;
		font-weight: 500;
		user-select: none;
		transition:
			background var(--duration) var(--ease-out),
			border-color var(--duration) var(--ease-out),
			color var(--duration) var(--ease-out);
	}

	/* 浏览文件 — 最浅，近白 */
	.btn-ghost {
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-secondary);
	}

	.btn-ghost:hover {
		background: var(--surface-hover);
		border-color: var(--border-strong);
		color: var(--text-primary);
	}

	/* 随机填入 — 最深，近黑 */
	.btn-primary {
		background: var(--text-primary);
		border: 1px solid var(--text-primary);
		color: #ffffff;
	}

	.btn-primary:hover {
		background: #2a2924;
		border-color: #2a2924;
	}

	/* 导出 XLSX — 中灰 */
	.btn-mid {
		background: #adaca8;
		border: 1px solid #9b9a97;
		color: #ffffff;
	}

	.btn-mid:hover {
		background: #9b9a97;
		border-color: #87867f;
	}

	/* ── 文件元信息 ───────────────────────────── */
	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4px 6px;
		background: var(--surface-hover);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	.meta-label {
		font-size: 11px;
		color: var(--text-muted);
	}

	.meta-value {
		font-size: 11px;
		font-family: var(--font-mono);
		font-weight: 600;
		color: var(--text-primary);
	}

	/* ── 错误提示 ─────────────────────────────── */
	.error {
		font-size: 11px;
		color: #eb5757;
		padding: 4px 6px;
		border: 1px solid #fbdada;
		border-radius: var(--radius-sm);
		background: #fef3f3;
		line-height: 1.5;
	}
</style>
