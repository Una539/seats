/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { type Student, type SubjectKey } from './seatingEngine';

export type RankingDimension =
	| 'totalScore'
	| 'schoolRank'
	| 'classRank'
	| 'progressScore'
	| SubjectKey;

export interface LeaderboardConfig {
	id: string;
	dimension: RankingDimension;
	topN: number;
}

/** 榜单条目 */
export interface Leaderboard {
	id: string;
	dimension: RankingDimension;
	topN: number;
	students: Student[];
}

const dimensionLabels: Record<RankingDimension, string> = {
	totalScore: '总分',
	schoolRank: '年级排名',
	classRank: '班级排名',
	progressScore: '进步分',
	chinese: '语文',
	math: '数学',
	english: '英语',
	physics: '物理',
	chemistry: '化学',
	biology: '生物'
};

export function getDimensionLabel(dim: RankingDimension): string {
	return dimensionLabels[dim] ?? dim;
}

const scoreDimensions = new Set<RankingDimension>([
	'totalScore',
	'progressScore',
	'chinese',
	'math',
	'english',
	'physics',
	'chemistry',
	'biology'
]);

/**
 * 判断某个维度是分数（越高越好）还是排名（越低越好）
 */
function isScoreDimension(dim: RankingDimension): boolean {
	return scoreDimensions.has(dim);
}

/**
 * 获取学生某个维度的值，用于排序。
 * 分数类返回 score，排名类返回 rank。
 */
function getDimensionValue(student: Student, dim: RankingDimension): number {
	if (dim === 'totalScore') return student.totalScore;
	if (dim === 'schoolRank') return student.schoolRank;
	if (dim === 'classRank') return student.classRank;
	if (dim === 'progressScore') return student.progressScore;
	return student.subjects[dim].score; // 单科维度按分数排序
}

/** 生成单个榜单 */
export function generateLeaderboard(students: Student[], config: LeaderboardConfig): Leaderboard {
	const isScore = isScoreDimension(config.dimension);
	const sorted = [...students].sort((a, b) => {
		const av = getDimensionValue(a, config.dimension);
		const bv = getDimensionValue(b, config.dimension);
		return isScore ? bv - av : av - bv;
	});

	// 取 topN，处理并列：若第 topN 名有并列，全部算上
	if (sorted.length === 0) {
		return { id: config.id, dimension: config.dimension, topN: config.topN, students: [] };
	}
	const cutoffIdx = Math.min(config.topN - 1, sorted.length - 1);
	const cutoffValue = getDimensionValue(sorted[cutoffIdx], config.dimension);

	const result: Student[] = [];
	for (const s of sorted) {
		const v = getDimensionValue(s, config.dimension);
		if (isScore ? v >= cutoffValue : v <= cutoffValue) {
			result.push(s);
		} else {
			break;
		}
	}

	return { id: config.id, dimension: config.dimension, topN: config.topN, students: result };
}

/** 生成所有榜单 */
export function generateAllLeaderboards(
	students: Student[],
	configs: LeaderboardConfig[]
): Leaderboard[] {
	return configs.map((c) => generateLeaderboard(students, c));
}

/** 汇总成绩单（支持去重），默认按年级排名升序排序 */
export function generateCombinedReport(
	students: Student[],
	leaderboards: Leaderboard[],
	deduplicate: boolean
): Array<Student & { leaderboards: string[] }> {
	const lbMap = new Map<string, string[]>();

	for (const lb of leaderboards) {
		for (const s of lb.students) {
			const existing = lbMap.get(s.id);
			if (existing) {
				existing.push(getDimensionLabel(lb.dimension));
			} else {
				lbMap.set(s.id, [getDimensionLabel(lb.dimension)]);
			}
		}
	}

	let source: Student[];
	if (deduplicate) {
		// 去重：仅保留出现在榜单中的学生
		const ids = new Set(lbMap.keys());
		source = students.filter((s) => ids.has(s.id));
	} else {
		source = [...students];
	}

	const result = source.map((s) => ({
		...s,
		leaderboards: lbMap.get(s.id) ?? []
	}));

	// 按年级排名升序
	result.sort((a, b) => a.schoolRank - b.schoolRank);
	return result;
}

/** 获取某个维度值（用于表格展示） */
export function getDisplayValue(student: Student, dim: RankingDimension): string | number {
	if (dim === 'totalScore') return student.totalScore;
	if (dim === 'schoolRank') return student.schoolRank;
	if (dim === 'classRank') return student.classRank;
	if (dim === 'progressScore') return student.progressScore;
	return student.subjects[dim].score;
}

/** 获取某个维度的排名值（用于表格展示排名列） */
export function getDisplayRank(student: Student, dim: RankingDimension): string | number {
	if (dim === 'totalScore') return student.schoolRank;
	if (dim === 'schoolRank') return student.schoolRank;
	if (dim === 'classRank') return student.classRank;
	if (dim === 'progressScore') return student.progressScore;
	return student.subjects[dim].rank;
}

/** 列的默认排序方向: true=asc, false=desc */
const defaultSortAsc = new Set<string>([
	'name',
	'group',
	'schoolRank',
	'classRank',
	'prevSchoolRank'
]);

function baseSubjectKey(key: string): SubjectKey | null {
	if (key === 'chinese' || key === 'chineseRank') return 'chinese';
	if (key === 'math' || key === 'mathRank') return 'math';
	if (key === 'english' || key === 'englishRank') return 'english';
	if (key === 'physics' || key === 'physicsRank') return 'physics';
	if (key === 'chemistry' || key === 'chemistryRank') return 'chemistry';
	if (key === 'biology' || key === 'biologyRank') return 'biology';
	return null;
}

/** 根据列 key 从学生对象中提取可比较值 */
export function getSortValue(
	row: Student & { leaderboards: string[] },
	key: string
): string | number {
	if (key === 'name') return row.name;
	if (key === 'group') return row.groupId;
	if (key === 'totalScore') return row.totalScore;
	if (key === 'schoolRank') return row.schoolRank;
	if (key === 'classRank') return row.classRank;
	if (key === 'prevSchoolRank') return row.prevSchoolRank;
	if (key === 'progressScore') return row.progressScore;
	if (key === 'leaderboards') return row.leaderboards.length;
	const subj = baseSubjectKey(key);
	if (!subj) return 0;
	if (key.endsWith('Rank')) return row.subjects[subj].rank;
	return row.subjects[subj].score;
}

/** 汇总成绩单排序 */
export function sortCombinedReport(
	report: Array<Student & { leaderboards: string[] }>,
	sortKey: string,
	direction: 'asc' | 'desc'
): Array<Student & { leaderboards: string[] }> {
	const copy = [...report];
	const isAsc = direction === 'asc';
	copy.sort((a, b) => {
		const av = getSortValue(a, sortKey);
		const bv = getSortValue(b, sortKey);
		if (typeof av === 'string' && typeof bv === 'string') {
			return isAsc ? av.localeCompare(bv, 'zh-CN') : bv.localeCompare(av, 'zh-CN');
		}
		// number 情况
		const an = Number(av);
		const bn = Number(bv);
		return isAsc ? an - bn : bn - an;
	});
	return copy;
}

/** 获取列的默认排序方向 */
export function getDefaultSortDirection(key: string): 'asc' | 'desc' {
	return defaultSortAsc.has(key) ? 'asc' : 'desc';
}
