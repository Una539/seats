/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal } from 'solid-js';
import { useSeatGrid } from '$lib/stores/useSeatGrid';
import { exportToXlsx } from '$lib/export';
import { localeStore, t } from '$lib/i18n';

/**
 * 应用级状态管理 Hook。
 * 整合名单数据、文件上传、模式切换、随机填充及导出功能。
 */
export function useAppState() {
	// 名单相关状态
	const [lines, setLines] = createSignal<string[]>([]);
	const [fileName, setFileName] = createSignal('');
	const [error, setError] = createSignal('');
	const [selectedLine, setSelectedLine] = createSignal('');
	const [mode, setMode] = createSignal<'fill' | 'remove'>('fill');

	const grid = useSeatGrid();
	const i18n = t;

	// 初始化时从浏览器存储或系统语言推断当前语言
	localeStore.init();

	/** 组件挂载时自动加载默认名单文件 names.txt */
	async function loadNames() {
		try {
			const res = await fetch('/names.txt');
			const text = await res.text();
			setLines(text.split(/\r?\n/).filter((line) => line.trim() !== ''));
			setFileName('names.txt');
		} catch (err) {
			setError('默认列表加载失败: ' + (err as Error).message);
		}
	}

	loadNames();

	/** 处理用户上传的 .txt 文件，按行解析为名单 */
	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		setFileName(file.name);
		setError('');
		setSelectedLine('');
		try {
			const text = await file.text();
			setLines(text.split(/\r?\n/).filter((line) => line.trim() !== ''));
		} catch (err) {
			setError('文件读取失败: ' + (err as Error).message);
			setLines([]);
		}
	}

	/** 从名单中选中一行（学生姓名） */
	function selectLine(line: string) {
		setSelectedLine(line);
	}

	/** 将已分配的学生从名单中移除 */
	function handleNameFill(name: string) {
		setLines((prev) => prev.filter((line) => line !== name));
		setSelectedLine('');
	}

	/** 将移除的学生重新加回名单 */
	function handleNameReturn(name: string) {
		setLines((prev) => [...prev, name]);
	}

	/** 触发随机填充：将名单中的姓名随机分配到空座位上 */
	function handleRandomFill() {
		grid.randomFill(lines(), (newLines: string[]) => setLines(newLines));
	}

	/** 触发导出当前座位网格为 XLSX 文件 */
	function handleExport() {
		exportToXlsx(grid);
	}

	/**
	 * 安全地切换操作模式（fill / remove）。
	 * 切换前会重置所有暂存状态（待清除、交换、批量操作等）。
	 */
	function setModeSafe(m: 'fill' | 'remove') {
		setMode(m);
		grid.setPendingClear(new Set<string>());
		grid.setSwapFirst(null);
		grid.resetBatch();
		setSelectedLine('');
	}

	/** 切换界面语言（en / cn） */
	function toggleLocale() {
		localeStore.setLocale(localeStore.locale() === 'en' ? 'cn' : 'en');
	}

	/** 将被过道挤出座位的学生姓名归还到名单 */
	function handleDisplace(names: string[]) {
		setLines((prev) => [...prev, ...names]);
	}

	return {
		lines,
		fileName,
		error,
		selectedLine,
		mode,
		grid,
		i18n,
		handleFileUpload,
		selectLine,
		handleNameFill,
		handleNameReturn,
		handleRandomFill,
		handleExport,
		setModeSafe,
		toggleLocale,
		handleDisplace
	};
}
