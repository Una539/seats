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

<!-- 文件上传控件和随机填入按钮 -->
<div class="top">
	<label class="btn file-btn">
		<span>浏览文件</span>
		<input type="file" accept=".txt" style="display: none;" onchange={onFileUpload} />
	</label>
	<button class="btn random-btn" onclick={onRandomFill}>随机填入</button>
	<button class="btn export-btn" onclick={onExport}>导出 XLSX</button>
</div>

<!-- 显示文件信息 -->
{#if fileName}
	<p>学生人数: {lineCount}</p>
{/if}

<!-- 显示错误信息 -->
{#if error}
	<p>{error}</p>
{/if}

<style>
	/** 顶部操作区域间距 */
	.top {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.btn {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		appearance: none;
		padding: 0.5rem;
		cursor: pointer;
		font-size: 14px;
		border-radius: 2px;
		user-select: none;
	}
	/** 文件上传按钮样式 */
	.file-btn {
		border: 1px solid #ddd;
		background: #fff;
	}
	.file-btn:hover {
		background: #fafafa;
	}
	/** 随机填入按钮样式 */
	.random-btn {
		border: 1px solid #1565c0;
		background: #1976d2;
	}
	.random-btn:hover {
		background: #1565c0;
	}
	/** 导出 Excel 按钮样式 */
	.export-btn {
		border: 1px solid #2e7d32;
		background: #4caf50;
	}
	.export-btn:hover {
		background: #2e7d32;
	}
</style>
