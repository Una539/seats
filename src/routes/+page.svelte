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
  右侧: 文件上传、随机填入和名单列表
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
</script>

<!-- 左右分栏布局 -->
<div class="layout">
	<div class="left">
		<ColumnControls {grid} />
		<SeatGrid {grid} {selectedLine} onNameReturn={handleNameReturn} onNameFill={handleNameFill} />
	</div>
	<div class="right">
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
</div>

<style>
	/** 左右分栏的容器 */
	.layout {
		display: flex;

		background: #f5f5f5;
		width: 100%;
		height: 100vh;
		box-sizing: border-box;
		overflow: hidden;
		user-select: none;
	}
	/** 左侧座位网格区域，占据 80% 宽度 */
	.left {
		width: 85%;
		padding: 1rem;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	/** 右侧控制面板区域，占据 20% 宽度 */
	.right {
		width: 15%;
		padding: 1rem;
		border-left: 1px solid #ddd;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: 10px 0 0 10px;
	}
</style>
