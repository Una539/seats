/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createRoot, createMemo, createSignal } from 'solid-js';
import { buildStudentData, type Student } from './seatingEngine';

/**
 * 全局考试数据共享层。
 * 排座引擎页面和统计页面共用同一数据源。
 */
function createExamDataStore() {
	const [currentRows, setCurrentRows] = createSignal<(string | number | null)[][]>([]);
	const [prevRows, setPrevRows] = createSignal<(string | number | null)[][]>([]);
	const [groupMap, setGroupMap] = createSignal<Record<string, number>>({});
	const [fileName, setFileName] = createSignal('');
	const [isReady, setIsReady] = createSignal(false);

	/** 派生的学生数据 */
	const students = createMemo<Student[]>(() => {
		if (!isReady()) return [];
		return buildStudentData(currentRows(), prevRows(), groupMap());
	});

	/** 加载新数据 */
	function loadData(params: {
		currentRows: (string | number | null)[][];
		prevRows: (string | number | null)[][];
		groupMap?: Record<string, number>;
		fileName?: string;
	}) {
		setCurrentRows(params.currentRows);
		setPrevRows(params.prevRows);
		setGroupMap(params.groupMap ?? {});
		setFileName(params.fileName ?? '');
		setIsReady(true);
	}

	/** 单独更新分组映射 */
	function updateGroupMap(map: Record<string, number>) {
		setGroupMap(map);
	}

	/** 清空数据 */
	function clearData() {
		setCurrentRows([]);
		setPrevRows([]);
		setGroupMap({});
		setFileName('');
		setIsReady(false);
	}

	return {
		currentRows,
		prevRows,
		groupMap,
		fileName,
		isReady,
		students,
		loadData,
		updateGroupMap,
		clearData
	};
}

/** 全局单例 */
export const examDataStore = createRoot(createExamDataStore);
