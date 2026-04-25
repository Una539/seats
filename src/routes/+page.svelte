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
  主页面组件
  负责组合所有子组件并管理应用级别的状态
  左侧: 座位网格和列控制
  右侧: 固定侧边栏 — 文件上传、随机填入和名单列表
-->

<script lang="ts">
	import ColumnControls from '$lib/components/ColumnControls.svelte';
	import SeatGrid from '$lib/components/SeatGrid.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import NameList from '$lib/components/NameList.svelte';
	import { SeatGridState } from '$lib/stores.svelte';
	import { exportToXlsx } from '$lib/export';

	/** 从文件读取的待分配名单 */
	let lines: string[] = $state([]);
	/** 当前加载的文件名 */
	let fileName = $state('');
	/** 文件加载错误信息 */
	let error = $state('');
	/** 用户在右侧名单中选中的姓名，点击网格时会填入此姓名 */
	let selectedLine = $state('');
	/** 当前操作模式：fill = 填入/交换，remove = 移除学生 */
	let mode: 'fill' | 'remove' = $state('fill');

	/** 座位网格状态实例，管理所有表格相关操作 */
	const grid = new SeatGridState();

	/**
	 * 页面加载时尝试从静态资源加载默认名单
	 * 如果 names.txt 不存在则静默失败
	 */
	async function loadNames() {
		try {
			const res = await fetch('/names.txt');
			const text = await res.text();
			lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
			fileName = 'names.txt';
		} catch (err) {
			error = '默认列表加载失败: ' + (err as Error).message;
		}
	}

	loadNames();

	/**
	 * 处理用户上传的 .txt 文件
	 * 按行解析文件名并更新名单
	 */
	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		fileName = file.name;
		error = '';
		selectedLine = '';

		try {
			const text = await file.text();
			lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
		} catch (err) {
			error = '文件读取失败: ' + (err as Error).message;
			lines = [];
		}
	}

	/** 更新选中的名单项 */
	function selectLine(line: string) {
		selectedLine = line;
	}

	/**
	 * 处理姓名填入网格
	 * 从待分配名单中删除该姓名并清除选中状态
	 */
	function handleNameFill(name: string) {
		lines = lines.filter((line) => line !== name);
		selectedLine = '';
	}

	/**
	 * 处理从网格移除的姓名
	 * 将姓名重新添加回待分配名单
	 */
	function handleNameReturn(name: string) {
		lines = [...lines, name];
	}

	/**
	 * 执行随机填入操作
	 * 将当前名单随机分配到可用的空白座位
	 */
	function handleRandomFill() {
		grid.randomFill(lines, (newLines) => {
			lines = newLines;
		});
	}

	function handleExport() {
		exportToXlsx(grid);
	}

	/**
	 * 切换模式时清除所有待操作状态
	 */
	function setMode(m: 'fill' | 'remove') {
		mode = m;
		grid.pendingClear.clear();
		grid.swapFirst = null;
		grid.resetBatch();
		selectedLine = '';
	}

	/**
	 * 过道操作导致学生被清退，将其加回名单
	 */
	function handleDisplace(names: string[]) {
		lines = [...lines, ...names];
	}
</script>

<!-- 主布局：左侧内容区 + 右侧固定侧边栏 -->
<div class="layout">
	<!-- 左侧：座位区域 -->
	<main class="main">
		<div class="main-inner">
			<ColumnControls {grid} onDisplace={handleDisplace} />
			<SeatGrid
				{grid}
				{mode}
				{selectedLine}
				onNameReturn={handleNameReturn}
				onNameFill={handleNameFill}
			/>
		</div>
	</main>

	<!-- 右侧：固定侧边栏 -->
	<aside class="sidebar">
		<div class="sidebar-header">
			<span class="sidebar-title">名单</span>
		</div>
		<!-- 模式切换 -->
		<div class="mode-bar">
			<button class="mode-btn" class:active={mode === 'fill'} onclick={() => setMode('fill')}
				>填座</button
			>
			<button
				class="mode-btn mode-btn-remove"
				class:active={mode === 'remove'}
				onclick={() => setMode('remove')}>移除</button
			>
		</div>
		<div class="sidebar-body">
			<FileUpload
				{fileName}
				lineCount={lines.length}
				{error}
				onFileUpload={handleFileUpload}
				onRandomFill={handleRandomFill}
				onExport={handleExport}
			/>
			<NameList {lines} {selectedLine} onSelect={selectLine} />
		</div>
	</aside>
</div>

<style>
	.layout {
		display: flex;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background: var(--bg);
	}

	/* ── 左侧内容区 ─────────────────────────────── */
	.main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 16px;
	}

	.main-inner {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 12px;
	}

	/* ── 右侧固定侧边栏 ─────────────────────────── */
	.sidebar {
		width: 200px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-left: 1px solid var(--border);
		background: var(--surface);
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		padding: 12px 16px 10px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.sidebar-title {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.sidebar-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 12px;
		gap: 12px;
	}

	/* ── 模式切换栏 ─────────────────────────────── */
	.mode-bar {
		display: grid;
		grid-template-columns: 1fr 1fr;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.mode-btn {
		padding: 7px 0;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 12px;
		font-weight: 500;
		color: var(--text-muted);
		transition:
			color var(--duration) var(--ease-out),
			background var(--duration) var(--ease-out);
	}

	.mode-btn:hover {
		color: var(--text-primary);
		background: var(--surface-hover);
	}

	.mode-btn.active {
		color: var(--text-primary);
		box-shadow: inset 0 -2px 0 var(--text-primary);
	}

	/* 移除模式激活时用红色下划线提示危险操作 */
	.mode-btn-remove.active {
		color: #eb5757;
		box-shadow: inset 0 -2px 0 #eb5757;
	}
</style>
