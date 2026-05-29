/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import * as ExcelJS from 'exceljs';
import { type Student } from '$lib/stores/seatingEngine';
import { getDimensionLabel, type Leaderboard } from '$lib/stores/useStats';

/** 表格可展示列配置 */
export interface ColumnConfig {
	key: string;
	label: string;
	width: number;
	getter: (s: Student & { leaderboards: string[] }) => string | number;
}

const allColumnConfigs: ColumnConfig[] = [
	{ key: 'name', label: '姓名', width: 12, getter: (s) => s.name },
	{ key: 'group', label: '小组', width: 10, getter: (s) => s.groupId },
	{ key: 'totalScore', label: '总分', width: 10, getter: (s) => s.totalScore },
	{ key: 'schoolRank', label: '年级排名', width: 10, getter: (s) => s.schoolRank },
	{ key: 'classRank', label: '班级排名', width: 10, getter: (s) => s.classRank },
	{ key: 'prevSchoolRank', label: '上次年级排名', width: 12, getter: (s) => s.prevSchoolRank },
	{ key: 'progressScore', label: '进步分', width: 10, getter: (s) => s.progressScore },
	{ key: 'chinese', label: '语文', width: 10, getter: (s) => s.subjects.chinese.score },
	{ key: 'chineseRank', label: '语文排名', width: 10, getter: (s) => s.subjects.chinese.rank },
	{ key: 'math', label: '数学', width: 10, getter: (s) => s.subjects.math.score },
	{ key: 'mathRank', label: '数学排名', width: 10, getter: (s) => s.subjects.math.rank },
	{ key: 'english', label: '英语', width: 10, getter: (s) => s.subjects.english.score },
	{ key: 'englishRank', label: '英语排名', width: 10, getter: (s) => s.subjects.english.rank },
	{ key: 'physics', label: '物理', width: 10, getter: (s) => s.subjects.physics.score },
	{ key: 'physicsRank', label: '物理排名', width: 10, getter: (s) => s.subjects.physics.rank },
	{ key: 'chemistry', label: '化学', width: 10, getter: (s) => s.subjects.chemistry.score },
	{ key: 'chemistryRank', label: '化学排名', width: 10, getter: (s) => s.subjects.chemistry.rank },
	{ key: 'biology', label: '生物', width: 10, getter: (s) => s.subjects.biology.score },
	{ key: 'biologyRank', label: '生物排名', width: 10, getter: (s) => s.subjects.biology.rank },
	{
		key: 'leaderboards',
		label: '所属榜单',
		width: 20,
		getter: (s) => s.leaderboards.join('、') || '-'
	}
];

/** 根据可见列 key 获取列配置 */
export function getVisibleColumns(visibleKeys: string[]): ColumnConfig[] {
	return allColumnConfigs.filter((c) => visibleKeys.includes(c.key));
}

/** 导出统计报告为 XLSX */
export async function exportStatsToXlsx(
	leaderboards: Leaderboard[],
	report: Array<Student & { leaderboards: string[] }>,
	visibleKeys: string[],
	filename: string = 'stats-report.xlsx'
) {
	const workbook = new ExcelJS.Workbook();

	// ── Sheet 1: 荣耀榜单 ──
	const lbSheet = workbook.addWorksheet('荣耀榜单');
	lbSheet.columns = [
		{ header: '榜单名称', key: 'name', width: 24 },
		{ header: 'Top N', key: 'topN', width: 8 },
		{ header: '姓名', key: 'student', width: 12 },
		{ header: '年级排名', key: 'rank', width: 12 },
		{ header: '总分', key: 'score', width: 10 }
	];
	lbSheet.getRow(1).font = { bold: true };
	lbSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

	let currentRow = 2;
	for (const lb of leaderboards) {
		if (lb.students.length === 0) {
			lbSheet.getCell(currentRow, 1).value = getDimensionLabel(lb.dimension) + ' Top ' + lb.topN;
			lbSheet.getCell(currentRow, 3).value = '暂无数据';
			currentRow += 1;
			continue;
		}
		for (let i = 0; i < lb.students.length; i++) {
			const s = lb.students[i];
			lbSheet.getCell(currentRow, 1).value =
				i === 0 ? getDimensionLabel(lb.dimension) + ' Top ' + lb.topN : '';
			lbSheet.getCell(currentRow, 2).value = i === 0 ? lb.topN : '';
			lbSheet.getCell(currentRow, 3).value = s.name;
			lbSheet.getCell(currentRow, 4).value = s.schoolRank;
			lbSheet.getCell(currentRow, 5).value = s.totalScore;
			currentRow += 1;
		}
		currentRow += 1; // 榜单间空行
	}

	// 给榜单区域加边框
	for (let r = 2; r < currentRow; r++) {
		for (let c = 1; c <= 5; c++) {
			lbSheet.getCell(r, c).border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' }
			};
		}
	}

	// ── Sheet 2: 汇总成绩单 ──
	const reportSheet = workbook.addWorksheet('汇总成绩单');
	const columns = getVisibleColumns(visibleKeys);
	reportSheet.columns = columns.map((c) => ({ header: c.label, key: c.key, width: c.width }));
	reportSheet.getRow(1).font = { bold: true };
	reportSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

	for (const s of report) {
		const row = reportSheet.addRow(columns.map((c) => c.getter(s)));
		row.alignment = { vertical: 'middle', horizontal: 'center' };
		for (let c = 1; c <= columns.length; c++) {
			row.getCell(c).border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' }
			};
		}
	}

	// ── 下载 ──
	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

/** 获取所有可选列的 key 列表 */
export function getAllColumnKeys(): string[] {
	return allColumnConfigs.map((c) => c.key);
}

/** 获取列标签 */
export function getColumnLabel(key: string): string {
	const found = allColumnConfigs.find((c) => c.key === key);
	return found?.label ?? key;
}
