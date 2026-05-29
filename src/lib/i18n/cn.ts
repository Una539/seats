/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 *
 * seats is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * seats is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with seats. If not, see <https://www.gnu.org/licenses/>.
 */

/** 中文语言包 (普通模式) */
export const cn = {
	layout: {
		title: 'Seats',
		subtitle: '教室座位编排工具'
	},
	modes: {
		fill: '入座',
		remove: '移除'
	},
	sidebar: {
		title: '待分配学生',
		pending: '待分配',
		browseFile: '学生名单',
		randomFill: '🎲 随机分配',
		exportXlsx: '导出 XLSX'
	},
	grid: {
		aisle: '过道'
	},
	usage: {
		assignTitle: '分配学生',
		assignStep1: '在右侧「待分配学生」名单中点击一名学生，将其选中',
		assignStep2: '点击网格中任意空座位，将该学生分配到该坐标',
		assignStep3: '分配成功后，学生姓名从名单中消失',
		swapTitle: '交换两名学生',
		swapStep1: '在「入座」模式下，点击已占座位 — 高亮「交换选中」',
		swapStep2: '点击另一个已占座位，两名学生互换坐标',
		swapStep3: '短暂的闪烁动画确认交换完成',
		removeTitle: '移除一名学生',
		removeStep1: '切换到「移除」模式（底部出现红色下划线提示）',
		removeStep2: '点击已占座位 — 变红提示确认',
		removeStep3: '再次点击确认移除，学生姓名回到名单',
		aisleTitle: '管理过道',
		aisleStep1: '点击网格上方的列按钮，可将该列切换为过道',
		aisleStep2: '该列中的学生会被自动清退并归还到名单',
		aisleStep3: '列按钮变深色表示该列已设为过道',
		bulkTitle: '批量禁用/启用座位',
		bulkDisableStep1: '在「入座」模式下且未选中学生时，点击空座位开始框选',
		bulkDisableStep2: '点击另一座位确定矩形范围，所有空座位高亮',
		bulkDisableStep3: '再次点击确认，将所有高亮座位禁用',
		bulkEnableStep1: '点击已禁用座位，高亮显示',
		bulkEnableStep2: '点击另一座位确定范围',
		bulkEnableStep3: '再次点击确认，将所有高亮座位启用'
	},
	engine: {
		pageTitle: '排座引擎',
		backToHome: '← 返回座位编排',
		run: '🔮 启动排座引擎',
		dataReady: '数据已就绪',
		errors: {
			noFile: '请先上传考试数据',
			noStudents: '未检测到有效学生，请检查数据格式',
			calcFailed: '排座失败: '
		},
		actions: {
			importToSeats: '将结果导入座位编排',
			downloadJSON: '下载配置 (.json)',
			downloadTXT: '导出报告 (.txt)'
		},
		xlsx: {
			sectionTitle: '考试数据',
			uploadBtn: '上传数据文件',
			uploaded: '文件已上传',
			currentSheet: '本次考试 Sheet',
			prevSheet: '上次考试 Sheet',
			parsed: (cur: string, prev: string, count: number) =>
				`已解析 ${cur} 与 ${prev}，共 ${count} 名学生`,
			previewCurrent: '本次考试预览',
			previewPrev: '上次考试预览',
			previewStudent: '学生',
			previewRank: '年级排名',
			totalPeople: (count: number) => `共 ${count} 人`
		},
		groups: {
			sectionTitle: '小组名单',
			loaded: '已加载',
			groupCount: (count: number) => `${count} 个小组`,
			source: '来源',
			defaultSource: '默认分组',
			uploadBtn: '上传自定义分组名册',
			groupLabel: (id: number) => `第 ${id} 小组`,
			membersEllipsis: (count: number) => `等 ${count} 人`
		},
		config: {
			sectionTitle: '引擎规则配置',
			resetDefaults: '重置默认配置',
			classTopN: '班级精英 Top N',
			mathSchoolTopN: '数学年级 Top N',
			mathScoreThreshold: '数学分数线',
			subjectQuota: '各科特权名额',
			progressMode: '进步模式',
			progressModeAll: '全员进步',
			progressModeTopN: 'Top N 进步者',
			progressTopN: '进步榜 Top N',
			weightsToggle: '积分权重配置',
			rank401Plus: '401+ 每前进1名',
			rank201Plus: '201-400 每前进1名',
			rank101Plus: '101-200 每前进1名',
			rank11Plus: '11-100 每前进1名',
			rank6Plus: '6-10 每前进1名',
			rank1To5: '1-5 每前进1名'
		},
		penalty: {
			sectionTitle: '排除名单',
			searchPlaceholder: '搜索姓名...',
			selectedCount: (count: number) => `已选择 ${count} 人`
		},
		result: {
			sectionTitle: '排座结果',
			privilege: '特权批次',
			progress: '进步批次',
			group: '小组批次',
			lottery: '抽签批次',
			peopleCount: (count: number) => `${count} 人`,
			excludedReason: '已排除: 受惩罚'
		}
	},
	stats: {
		pageTitle: '数据统计',
		backToHome: '← 返回座位编排',
		goToEngine: '→ 排座引擎',
		uploadData: '考试数据',
		leaderboards: '榜单',
		combinedReport: '汇总成绩单',
		exportXlsx: '导出统计报告',
		deduplicate: '去重汇总（同一学生在多个榜单中只保留一次）',
		columnVisibility: '展示列',
		dimensions: {
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
		},
		addLeaderboard: '+ 添加榜单',
		removeLeaderboard: '删除',
		topN: 'Top N',
		noData: '请先上传考试数据以查看统计',
		groupTooltip: '该学生所属的学习小组编号',
		onlyLeaderboard: '仅榜单学生',
		withLeaderboard: '含榜单标记',
		none: '无'
	},
	subjects: {
		chinese: '语文',
		math: '数学',
		english: '英语',
		physics: '物理',
		chemistry: '化学',
		biology: '生物'
	}
} as const;
