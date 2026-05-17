/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

// 类型定义
export type SubjectKey = 'chinese' | 'math' | 'english' | 'physics' | 'chemistry' | 'biology';

export const SubjectNames: Record<SubjectKey, string> = {
	chinese: '言灵·语文',
	math: '炼金·数学',
	english: '异邦·英语',
	physics: '奥术·物理',
	chemistry: '魔药·化学',
	biology: '生命·生物'
};

export interface Student {
	id: string;
	name: string;
	groupId: number;

	// 本次考试
	totalScore: number;
	classRank: number;
	schoolRank: number;
	subjects: Record<SubjectKey, { score: number; rank: number }>;

	// 上次考试
	prevSchoolRank: number;
	progressScore: number;
}

export interface SeatingResult {
	privilegeBatch: Array<{ name: string; reason: string }>; // 个人成绩
	progressBatch: Array<{ name: string; reason: string }>; // 进步逆袭
	groupBatch: Array<{ name: string; reason: string }>; // 最强小组打捞
	lotteryBatch: Array<{ name: string; reason: string }>; // 命运抽签
}

/** 将排座结果按批次优先级展平为学生姓名数组 */
export function flattenSeatingResult(result: SeatingResult): string[] {
	return [
		...result.privilegeBatch.map((s) => s.name),
		...result.progressBatch.map((s) => s.name),
		...result.groupBatch.map((s) => s.name),
		...result.lotteryBatch.map((s) => s.name)
	];
}

/** 判断姓名是否为分隔符 */
export function isDivider(name: string): boolean {
	return name.startsWith('---') && name.endsWith('---');
}

/** 将排座结果按引擎子类别顺序展平，并在各子类别之间插入分隔符 */
export function flattenSeatingResultWithDividers(result: SeatingResult): string[] {
	const names: string[] = [];

	// 特权批次内部按子类别分组
	const privilegeGroups: Record<string, string[]> = {
		'--- 天选·综合 ---': [],
		'--- 天选·炼金数学 ---': [],
		'--- 天选·其他学派 ---': []
	};

	for (const item of result.privilegeBatch) {
		if (item.reason.startsWith('天选·综合')) {
			privilegeGroups['--- 天选·综合 ---'].push(item.name);
		} else if (
			item.reason.startsWith('天选·炼金数学') ||
			item.reason.startsWith('炼金·数学极优') ||
			item.reason.startsWith('炼金·数学单科特权顺延')
		) {
			privilegeGroups['--- 天选·炼金数学 ---'].push(item.name);
		} else if (item.reason.includes('特权顺延')) {
			privilegeGroups['--- 天选·其他学派 ---'].push(item.name);
		}
	}

	const privilegeOrder = ['--- 天选·综合 ---', '--- 天选·炼金数学 ---', '--- 天选·其他学派 ---'];

	for (const groupKey of privilegeOrder) {
		const members = privilegeGroups[groupKey];
		if (members.length > 0) {
			names.push(groupKey, ...members);
		}
	}

	// 进步逆袭
	if (result.progressBatch.length > 0) {
		names.push('--- 逆袭勇者 ---');
		names.push(...result.progressBatch.map((s) => s.name));
	}

	// 最强小组
	if (result.groupBatch.length > 0) {
		names.push('--- 最强公会 ---');
		names.push(...result.groupBatch.map((s) => s.name));
	}

	// 命运抽签
	if (result.lotteryBatch.length > 0) {
		names.push('--- 命运轮盘 ---');
		names.push(...result.lotteryBatch.map((s) => s.name));
	}

	return names;
}

const STORAGE_KEY = 'seatingEngineResult';

/** 将排座结果存入 sessionStorage */
export function saveResultToStorage(names: string[]): void {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(names));
	} catch {
		// ignore storage errors
	}
}

/** 从 sessionStorage 读取排座结果 */
export function loadResultFromStorage(): string[] | null {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
			return parsed;
		}
		return null;
	} catch {
		return null;
	}
}

/** 清除 sessionStorage 中的排座结果 */
export function clearResultStorage(): void {
	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}

export interface ProgressWeights {
	rank401Plus: number;
	rank201Plus: number;
	rank101Plus: number;
	rank11Plus: number;
	rank6Plus: number;
	rank1To5: number;
}

export const DefaultProgressWeights: ProgressWeights = {
	rank401Plus: 1,
	rank201Plus: 2,
	rank101Plus: 3,
	rank11Plus: 5,
	rank6Plus: 50,
	rank1To5: 100
};

export interface SeatingConfig {
	privilegeClassTopN: number;
	privilegeMathSchoolTopN: number;
	privilegeMathScoreThreshold: number;
	subjectPrivilegeQuota: number;
	progressMode: 'all' | 'topN';
	progressTopN: number;
	progressWeights: ProgressWeights;
}

export const DefaultSeatingConfig: SeatingConfig = {
	privilegeClassTopN: 5,
	privilegeMathSchoolTopN: 10,
	privilegeMathScoreThreshold: 140,
	subjectPrivilegeQuota: 1,
	progressMode: 'all',
	progressTopN: 10,
	progressWeights: DefaultProgressWeights
};

function safeNum(val: string | number | undefined | null, defaultVal: number): number {
	if (val === undefined || val === null) return defaultVal;
	const str = String(val).trim();
	if (str === '') return defaultVal;
	const n = Number(str);
	return isNaN(n) ? defaultVal : n;
}

// 核心数学逻辑：分段积分计算器
export function calculateProgressScore(
	oldRank: number,
	newRank: number,
	weights: ProgressWeights = DefaultProgressWeights
): number {
	// 缺乏历史数据或退步，积分为 0
	if (oldRank >= 9999 || newRank >= oldRank) return 0;

	let score = 0;
	// 模拟逐个名次往上爬的过程，跨越哪个区间就拿哪个区间的积分
	for (let r = oldRank; r > newRank; r--) {
		if (r >= 401) score += weights.rank401Plus;
		else if (r >= 201) score += weights.rank201Plus;
		else if (r >= 101) score += weights.rank101Plus;
		else if (r >= 11) score += weights.rank11Plus;
		else if (r >= 6) score += weights.rank6Plus;
		else score += weights.rank1To5; // 1-5名
	}
	return score;
}

// 数据处理
// 本次考试 sheet 列格式: 姓名 | 总分 | 校次 | 班次 | 语文/校次 | 数学/校次 | 英语/校次 | 物理/校次 | 化学/校次 | 生物/校次
// 上次考试 sheet 列格式: 姓名 | 总分 | 校次 | 语文/校次 | 数学/校次 | 英语/校次 | 物理/校次 | 化学/校次 | 生物/校次
export function buildStudentData(
	currentRows: (string | number | null)[][],
	prevRows: (string | number | null)[][],
	groupMap: Record<string, number> = {}
): Student[] {
	// 1. 读取上次考试 提取旧的年级排名
	const prevRankMap = new Map<string, number>();
	for (let i = 1; i < prevRows.length; i++) {
		const row = prevRows[i];
		if (!row || row.length < 3) continue;
		const name = String(row[0] ?? '').trim();
		if (!name) continue;
		const schoolRank = safeNum(row[2], 9999);
		prevRankMap.set(name, schoolRank);
	}

	// 2. 读取本次考试 生成基础学生数据
	const rawStudents: Array<{
		name: string;
		schoolRank: number;
		classRank: number | null;
		totalScore: number;
		subjects: Record<SubjectKey, { score: number; rank: number }>;
		prevSchoolRank: number;
	}> = [];

	for (let i = 1; i < currentRows.length; i++) {
		const row = currentRows[i];
		if (!row || row.length < 15) continue;

		const name = String(row[0] ?? '').trim();
		if (!name) continue;

		const prevSchoolRank = prevRankMap.get(name) ?? 9999;
		const currentSchoolRank = safeNum(row[2], 9999);

		// 自动检测是否有班次列：16列表示有班次，15列表示没有
		// 格式A (15列): 姓名 | 总分 | 校次 | 语文 | 校次 | 数学 | 校次 | ... | 生物 | 校次
		// 格式B (16列): 姓名 | 总分 | 校次 | 班次 | 语文 | 校次 | 数学 | 校次 | ... | 生物 | 校次
		const hasClassRank = row.length >= 16;
		const off = hasClassRank ? 1 : 0;

		let classRank: number | null = null;
		if (hasClassRank && row[3] !== undefined && row[3] !== null && String(row[3]).trim() !== '') {
			const n = Number(row[3]);
			if (!isNaN(n)) classRank = n;
		}

		const subjects: Record<SubjectKey, { score: number; rank: number }> = {
			chinese: { score: safeNum(row[3 + off], 0), rank: safeNum(row[4 + off], 9999) },
			math: { score: safeNum(row[5 + off], 0), rank: safeNum(row[6 + off], 9999) },
			english: { score: safeNum(row[7 + off], 0), rank: safeNum(row[8 + off], 9999) },
			physics: { score: safeNum(row[9 + off], 0), rank: safeNum(row[10 + off], 9999) },
			chemistry: { score: safeNum(row[11 + off], 0), rank: safeNum(row[12 + off], 9999) },
			biology: { score: safeNum(row[13 + off], 0), rank: safeNum(row[14 + off], 9999) }
		};

		rawStudents.push({
			name,
			schoolRank: currentSchoolRank,
			classRank,
			totalScore: safeNum(row[1], 0),
			subjects,
			prevSchoolRank
		});
	}

	// 动态计算班排：按年级排名升序排序后依次赋予（处理并列，标准竞争排名）
	// 无论 xlsx 是否提供了班次列，都重新计算以确保并列处理正确
	rawStudents.sort((a, b) => a.schoolRank - b.schoolRank);
	for (let i = 0; i < rawStudents.length; i++) {
		// 并列者同 rank，下一名次 = 当前位置 + 1
		if (i === 0 || rawStudents[i].schoolRank !== rawStudents[i - 1].schoolRank) {
			rawStudents[i].classRank = i + 1;
		} else {
			rawStudents[i].classRank = rawStudents[i - 1].classRank;
		}
	}

	// 构建最终的 Student 数组
	const students: Student[] = rawStudents.map((s) => {
		let groupId = groupMap[s.name];
		if (!groupId) {
			groupId = (s.name.charCodeAt(0) % 6) + 1;
		}
		return {
			id: s.name,
			name: s.name,
			groupId,
			totalScore: s.totalScore,
			schoolRank: s.schoolRank,
			classRank: s.classRank!,
			subjects: s.subjects,
			prevSchoolRank: s.prevSchoolRank,
			progressScore: calculateProgressScore(s.prevSchoolRank, s.schoolRank)
		};
	});

	return students;
}

// 核心规则
export function generateSeatingArrangement(
	students: Student[],
	config: SeatingConfig = DefaultSeatingConfig,
	excludedIds: Set<string> = new Set()
): SeatingResult {
	const selectedIds = new Set<string>();
	const result: SeatingResult = {
		privilegeBatch: [],
		progressBatch: [],
		groupBatch: [],
		lotteryBatch: []
	};

	// 辅助闭包：向批次添加并去重
	const addToBatch = (s: Student, batch: Array<any>, reason: string) => {
		if (!selectedIds.has(s.id)) {
			batch.push({ name: s.name, reason });
			selectedIds.add(s.id);
		}
	};

	// --- 阶段一：特权与顺延去重 ---

	// 1. 班级前 N 名优先（按年级排名动态计算出的班排）
	// 处理并列：取前 N 名时，如果第 N 名有并列，全部算上
	// 被惩罚的学生跳过，名额顺延给下一位
	const sortedByClassRank = [...students].sort((a, b) => a.classRank - b.classRank);
	const topClass: Student[] = [];
	let validCount = 0;
	let cutoffRank = Infinity;

	for (const s of sortedByClassRank) {
		if (excludedIds.has(s.id)) continue;
		validCount++;
		if (validCount <= config.privilegeClassTopN) {
			topClass.push(s);
			cutoffRank = s.classRank;
		} else if (s.classRank === cutoffRank) {
			topClass.push(s);
		} else {
			break;
		}
	}
	topClass.forEach((s) =>
		addToBatch(
			s,
			result.privilegeBatch,
			`天选·综合: 公会第${s.classRank}名(全服第${s.schoolRank}名)`
		)
	);

	// 2. 数学单科年级前 N 名（被惩罚者跳过）
	const topMath = students
		.filter((s) => s.subjects.math.rank <= config.privilegeMathSchoolTopN && !excludedIds.has(s.id))
		.sort((a, b) => a.subjects.math.rank - b.subjects.math.rank);
	topMath.forEach((s) =>
		addToBatch(s, result.privilegeBatch, `天选·炼金数学: 全服第${s.subjects.math.rank}名`)
	);

	// 3. 其他各科单科特权，遇冲突往下顺延，每科 quota 个名额
	// 注：数学已在步骤2单独处理，此处不再重复
	const subjectsOrder: SubjectKey[] = ['chinese', 'english', 'physics', 'chemistry', 'biology'];
	for (const subjKey of subjectsOrder) {
		const sortedBySubject = [...students].sort(
			(a, b) => a.subjects[subjKey].rank - b.subjects[subjKey].rank
		);

		let quota = config.subjectPrivilegeQuota;
		for (const s of sortedBySubject) {
			if (quota <= 0) break;
			if (selectedIds.has(s.id)) continue;
			if (excludedIds.has(s.id)) continue;
			addToBatch(
				s,
				result.privilegeBatch,
				`${SubjectNames[subjKey]} 特权顺延 (学派第${s.subjects[subjKey].rank}名)`
			);
			quota--;
		}
	}

	// 4. 数学的额外特殊兜底（分数线以上特权，被惩罚者跳过）
	students.forEach((s) => {
		if (
			s.subjects.math.score >= config.privilegeMathScoreThreshold &&
			!selectedIds.has(s.id) &&
			!excludedIds.has(s.id)
		) {
			addToBatch(s, result.privilegeBatch, `炼金·数学极优: ${s.subjects.math.score}分`);
		}
	});

	// --- 阶段二：积分逆袭排位 ---

	// 选出尚未排座且有进步的人（被惩罚者跳过）
	let progressCandidates = students
		.filter((s) => !selectedIds.has(s.id) && !excludedIds.has(s.id) && s.progressScore > 0)
		.sort((a, b) => b.progressScore - a.progressScore); // 积分高者优先

	if (config.progressMode === 'topN') {
		// 处理并列：取前 N 名时，如果第 N 名有并列，全部算上
		if (progressCandidates.length > config.progressTopN) {
			const cutoffScore = progressCandidates[config.progressTopN - 1].progressScore;
			progressCandidates = progressCandidates.filter((s) => s.progressScore >= cutoffScore);
		}
	}

	progressCandidates.forEach((s) => {
		addToBatch(
			s,
			result.progressBatch,
			`逆袭勇者: 积分${s.progressScore} (全服${s.prevSchoolRank}名 🚀 ${s.schoolRank}名)`
		);
	});

	// --- 阶段三：最强小组打捞 ---

	const groupStats: Record<number, { totalScore: number; count: number }> = {};
	students.forEach((s) => {
		if (!groupStats[s.groupId]) groupStats[s.groupId] = { totalScore: 0, count: 0 };
		groupStats[s.groupId].totalScore += s.totalScore;
		groupStats[s.groupId].count += 1;
	});

	let bestGroupId = -1;
	let highestAvg = -1;
	Object.keys(groupStats).forEach((groupIdStr) => {
		const gid = Number(groupIdStr);
		const avg = groupStats[gid].totalScore / groupStats[gid].count;
		if (avg > highestAvg) {
			highestAvg = avg;
			bestGroupId = gid;
		}
	});

	// 捞出第一名小组还没选座位的人（被惩罚者跳过）
	const bestGroupMembers = students.filter(
		(s) => s.groupId === bestGroupId && !selectedIds.has(s.id) && !excludedIds.has(s.id)
	);
	bestGroupMembers.forEach((s) => {
		addToBatch(s, result.groupBatch, `最强公会福利: ${bestGroupId}号公会平均分全服第一`);
	});

	// --- 阶段四：命运兜底抽签 ---

	// 被惩罚的学生直接放入命运轮盘
	students.forEach((s) => {
		if (excludedIds.has(s.id) && !selectedIds.has(s.id)) {
			addToBatch(s, result.lotteryBatch, '放逐: 受惩罚');
		}
	});

	// 剩余未触发任何奖励的学生
	const remaining = students.filter((s) => !selectedIds.has(s.id) && !excludedIds.has(s.id));
	remaining.forEach((s) => {
		addToBatch(s, result.lotteryBatch, '未触发任何奖励，进入命运轮盘');
	});

	return result;
}

export interface ExportedSeatingResult {
	version: string;
	generatedAt: string;
	result: SeatingResult;
}

/** 将排座引擎完整结果导出为 JSON 字符串 */
export function exportResultToJSON(result: SeatingResult): string {
	const payload: ExportedSeatingResult = {
		version: 'seats-v1',
		generatedAt: new Date().toISOString(),
		result
	};
	return JSON.stringify(payload, null, 2);
}

/** 将排座结果导出为人类可读的 TXT 格式 */
export function exportResultToTXT(result: SeatingResult): string {
	const now = new Date();
	const timeStr = now.toISOString().slice(0, 19).replace('T', ' ');

	const lines: string[] = [];
	lines.push('【炼金术座位分配结果】');
	lines.push(`生成时间：${timeStr}`);
	lines.push('版本：seats-v1');
	lines.push('');
	lines.push('════════════════════════════════════════════════════════');
	lines.push('一、天选特权批次');
	lines.push('════════════════════════════════════════════════════════');
	lines.push('');

	// 特权批次内部按子类别分组
	const privilegeGroups: Record<string, Array<{ name: string; reason: string }>> = {
		'天选·综合': [],
		'天选·炼金数学': [],
		'天选·其他学派': []
	};

	for (const item of result.privilegeBatch) {
		if (item.reason.startsWith('天选·综合')) {
			privilegeGroups['天选·综合'].push(item);
		} else if (
			item.reason.startsWith('天选·炼金数学') ||
			item.reason.startsWith('炼金·数学极优') ||
			item.reason.startsWith('炼金·数学单科特权顺延')
		) {
			privilegeGroups['天选·炼金数学'].push(item);
		} else if (item.reason.includes('特权顺延')) {
			privilegeGroups['天选·其他学派'].push(item);
		}
	}

	// 天选·综合
	if (privilegeGroups['天选·综合'].length > 0) {
		lines.push('【天选·综合排名】');
		for (const item of privilegeGroups['天选·综合']) {
			const match = item.reason.match(/公会第(\d+)名\(全服第(\d+)名\)/);
			if (match) {
				lines.push(`${item.name.padEnd(8)} 公会第${match[1]}名 (全服第${match[2]}名)`);
			} else {
				lines.push(`${item.name.padEnd(8)} ${item.reason}`);
			}
		}
		lines.push('');
	}

	// 天选·炼金数学
	if (privilegeGroups['天选·炼金数学'].length > 0) {
		lines.push('【天选·炼金数学】');
		for (const item of privilegeGroups['天选·炼金数学']) {
			const match = item.reason.match(/全服第(\d+)名/);
			if (match) {
				lines.push(`${item.name.padEnd(8)} 全服第${match[1]}名`);
			} else {
				lines.push(`${item.name.padEnd(8)} ${item.reason}`);
			}
		}
		lines.push('');
	}

	// 其他学派
	if (privilegeGroups['天选·其他学派'].length > 0) {
		for (const item of privilegeGroups['天选·其他学派']) {
			const match = item.reason.match(/^(.+?) 特权顺延 \(学派第(\d+)名\)/);
			if (match) {
				lines.push(`【${match[1]} 特权顺延】`);
				lines.push(`${item.name.padEnd(8)} 学派第${match[2]}名`);
			} else {
				lines.push(`${item.name.padEnd(8)} ${item.reason}`);
			}
		}
		lines.push('');
	}

	// 逆袭勇者
	if (result.progressBatch.length > 0) {
		lines.push('════════════════════════════════════════════════════════');
		lines.push('二、逆袭勇者 (进步奖励)');
		lines.push('════════════════════════════════════════════════════════');
		lines.push('');
		lines.push('姓名        积分    全服排名      进步名次');
		for (const item of result.progressBatch) {
			const match = item.reason.match(/积分(\d+) \(全服(\d+)名 🚀 (\d+)名\)/);
			if (match) {
				const score = match[1];
				const prevRank = match[2];
				const currRank = match[3];
				const progress = Number(prevRank) - Number(currRank);
				lines.push(
					`${item.name.padEnd(10)} ${score.padEnd(7)} ${prevRank.padEnd(5)}名         ↑${progress}名`
				);
			} else {
				lines.push(`${item.name.padEnd(10)} ${item.reason}`);
			}
		}
		lines.push('');
	}

	// 最强公会
	if (result.groupBatch.length > 0) {
		lines.push('════════════════════════════════════════════════════════');
		lines.push('三、最强公会福利');
		lines.push('════════════════════════════════════════════════════════');
		lines.push('');
		const match = result.groupBatch[0]?.reason.match(/(\d+)号公会平均分全服第一/);
		if (match) {
			lines.push(`${match[1]}号公会平均分全服第一：`);
		} else {
			lines.push('最强公会福利：');
		}
		lines.push(result.groupBatch.map((s) => s.name).join('、'));
		lines.push('');
	}

	// 放逐与命运轮盘
	if (result.lotteryBatch.length > 0) {
		lines.push('════════════════════════════════════════════════════════');
		lines.push('四、放逐与命运轮盘');
		lines.push('════════════════════════════════════════════════════════');
		lines.push('');

		const exiled = result.lotteryBatch.filter((s) => s.reason === '放逐: 受惩罚');
		const lottery = result.lotteryBatch.filter((s) => s.reason !== '放逐: 受惩罚');

		if (exiled.length > 0) {
			lines.push('【放逐 - 受惩罚】');
			lines.push(exiled.map((s) => s.name).join('、'));
			lines.push('');
		}

		if (lottery.length > 0) {
			lines.push('【命运轮盘 - 未触发奖励】');
			// 每行显示5个名字
			const names = lottery.map((s) => s.name);
			for (let i = 0; i < names.length; i += 5) {
				lines.push(names.slice(i, i + 5).join('、'));
			}
			lines.push('');
		}
	}

	// 人数统计
	const total =
		result.privilegeBatch.length +
		result.progressBatch.length +
		result.groupBatch.length +
		result.lotteryBatch.length;

	lines.push('════════════════════════════════════════════════════════');
	lines.push('');
	lines.push('【人数统计】');
	lines.push(`特权批次：   ${String(result.privilegeBatch.length).padStart(2)}人`);
	lines.push(`逆袭勇者：   ${String(result.progressBatch.length).padStart(2)}人`);
	lines.push(`公会福利：   ${String(result.groupBatch.length).padStart(2)}人`);
	lines.push(
		`放逐：       ${String(result.lotteryBatch.filter((s) => s.reason === '放逐: 受惩罚').length).padStart(2)}人`
	);
	lines.push(
		`命运轮盘：   ${String(result.lotteryBatch.filter((s) => s.reason !== '放逐: 受惩罚').length).padStart(2)}人`
	);
	lines.push('════════════════════════════════════════════════════════');
	lines.push(`总计：       ${String(total).padStart(2)}人`);
	lines.push('════════════════════════════════════════════════════════');
	lines.push('');

	return lines.join('\n');
}

/** 从 JSON 字符串解析排座引擎结果，返回带分隔符的名单数组 */
export function importResultFromJSON(json: string): string[] | null {
	try {
		const parsed = JSON.parse(json);
		if (typeof parsed !== 'object' || parsed === null) return null;
		if (!parsed.result || typeof parsed.result !== 'object') return null;
		const r = parsed.result;
		if (
			!Array.isArray(r.privilegeBatch) ||
			!Array.isArray(r.progressBatch) ||
			!Array.isArray(r.groupBatch) ||
			!Array.isArray(r.lotteryBatch)
		) {
			return null;
		}
		return flattenSeatingResultWithDividers(r as SeatingResult);
	} catch {
		return null;
	}
}
