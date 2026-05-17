/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal } from 'solid-js';
import { useSeatGrid } from '$lib/stores/useSeatGrid';
import { exportToXlsx } from '$lib/export';
import { localeStore, t } from '$lib/i18n';
import {
	loadResultFromStorage,
	clearResultStorage,
	importResultFromJSON,
	isDivider
} from '$lib/stores/seatingEngine';
import { ROWS, COLS } from '$lib/stores/gridState';

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

	/** 应用初始化：优先加载引擎结果，否则加载默认名单 */
	async function init() {
		const engineNames = loadResultFromStorage();
		if (engineNames && engineNames.length > 0) {
			setFileName('排座引擎结果');
			setError('');
			setSelectedLine('');
			// 清空座位网格
			const empty = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
			grid.setTableData(empty);
			grid.setPendingClear(new Set<string>());
			grid.setSwapFirst(null);
			grid.resetBatch();
			// 将引擎结果（含分隔符）全部加载到侧边栏
			setLines(engineNames);
			clearResultStorage();
			return;
		}

		// 没有引擎结果，加载默认名单
		try {
			const res = await fetch('/names.txt');
			const text = await res.text();
			setLines(text.split(/\r?\n/).filter((line) => line.trim() !== ''));
			setFileName('names.txt');
		} catch (err) {
			setError('默认列表加载失败: ' + (err as Error).message);
		}
	}

	init();

	/** 处理用户上传的文件：.txt 按行解析，.json 解析引擎结果 */
	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		setFileName(file.name);
		setError('');
		setSelectedLine('');
		try {
			const text = await file.text();
			if (file.name.endsWith('.json')) {
				const names = importResultFromJSON(text);
				if (names === null) {
					setError('JSON 格式不正确或不是有效的引擎结果');
					setLines([]);
				} else {
					setLines(names);
				}
			} else {
				setLines(text.split(/\r?\n/).filter((line) => line.trim() !== ''));
			}
		} catch (err) {
			setError('文件读取失败: ' + (err as Error).message);
			setLines([]);
		}
	}

	/** 从名单中选中一行（学生姓名），分隔符不可选中 */
	function selectLine(line: string) {
		if (isDivider(line)) return;
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

	/** 触发随机填充：将名单中的姓名随机分配到空座位上（跳过分隔符） */
	function handleRandomFill() {
		const realLines = lines().filter((line) => !isDivider(line));
		grid.randomFill(realLines, (newLines: string[]) => {
			const dividers = lines().filter(isDivider);
			setLines([...dividers, ...newLines]);
		});
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
