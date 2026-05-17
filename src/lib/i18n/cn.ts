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

/** 中文语言包 */
export const cn = {
	layout: {
		title: 'Seats',
		subtitle: '教室座位编排黑科技'
	},
	modes: {
		fill: '入座',
		remove: '驱逐'
	},
	sidebar: {
		title: '待召唤勇士',
		pending: '待召唤',
		browseFile: '召唤名单',
		randomFill: '🎲 随机召唤',
		exportXlsx: '导出 XLSX'
	},
	grid: {
		 aisle: '过道'
	},
	usage: {
		assignTitle: '分配勇士',
		assignStep1: '在右侧「待召唤勇士」名单中点击一名勇士，将其选中',
		assignStep2: '点击网格中任意空座位，将该勇士分配到该坐标',
		assignStep3: '分配成功后，勇士姓名从名单中消失',
		swapTitle: '交换两名勇士',
		swapStep1: '在「入座」模式下，点击已占领座位 — 高亮「交换选中」',
		swapStep2: '点击另一个已占领座位，两名勇士互换坐标',
		swapStep3: '短暂的闪烁动画确认交换完成',
		removeTitle: '驱逐一名勇士',
		removeStep1: '切换到「驱逐」模式（底部出现红色下划线提示）',
		removeStep2: '点击已占领座位 — 变红提示确认',
		removeStep3: '再次点击确认驱逐，勇士姓名回到名单',
		aisleTitle: '管理过道',
		aisleStep1: '点击网格上方的列按钮，可将该列切换为过道',
		aisleStep2: '该列中的勇士会被自动清退并归还到名单',
		aisleStep3: '列按钮变深色表示该列已设为过道',
		bulkTitle: '批量封印/解封座位',
		bulkDisableStep1: '在「入座」模式下且未选中勇士时，点击空座位开始框选',
		bulkDisableStep2: '点击另一座位确定矩形范围，所有空座位高亮',
		bulkDisableStep3: '再次点击确认，将所有高亮座位封印',
		bulkEnableStep1: '点击已封印座位，高亮显示',
		bulkEnableStep2: '点击另一座位确定范围',
		bulkEnableStep3: '再次点击确认，将所有高亮座位解封'
	},
	engine: {
		pageTitle: '排座炼金术阵',
		backToHome: '← 返回座位编排',
		run: '🔮 启动炼成阵！',
		dataReady: '炼金材料就绪',
		errors: {
			noFile: '请先上传炼金材料',
			noStudents: '未检测到可召唤的勇士，请检查配方',
			calcFailed: '炼成失败: '
		},
		actions: {
			importToSeats: '将炼成结果导入座位编排',
			downloadJSON: '下载炼金配方 (.json)'
		},
		xlsx: {
			sectionTitle: '炼金原料',
			uploadBtn: '上传配方书',
			uploaded: '配方已录入',
			currentSheet: '本次试炼 Sheet',
			prevSheet: '上次试炼 Sheet',
			parsed: (cur: string, prev: string, count: number) => `已解析 ${cur} 与 ${prev}，共 ${count} 名勇士`,
			previewCurrent: '本次试炼预览',
			previewPrev: '上次试炼预览',
			previewStudent: '勇士',
			previewRank: '全服排名',
			totalPeople: (count: number) => `共 ${count} 人`
		},
		groups: {
			sectionTitle: '公会名单',
			loaded: '已集结',
			groupCount: (count: number) => `${count} 个公会`,
			source: '来源',
			defaultSource: '默认公会',
			uploadBtn: '上传自定义公会名册',
			groupLabel: (id: number) => `${id} 号公会`,
			membersEllipsis: (count: number) => `等 ${count} 人`
		},
		config: {
			sectionTitle: '炼金规则配置',
			resetDefaults: '重置配方',
			classTopN: '公会精英 Top N',
			mathSchoolTopN: '炼金·数学全服 Top N',
			mathScoreThreshold: '炼金·数学分数线',
			subjectQuota: '各学派特权名额',
			progressMode: '逆袭模式',
			progressModeAll: '全员逆袭',
			progressModeTopN: 'Top N 逆袭者',
			progressTopN: '逆袭榜 Top N',
			weightsToggle: '积分权重配方',
			rank401Plus: '401+ 每前进1名',
			rank201Plus: '201-400 每前进1名',
			rank101Plus: '101-200 每前进1名',
			rank11Plus: '11-100 每前进1名',
			rank6Plus: '6-10 每前进1名',
			rank1To5: '1-5 每前进1名'
		},
		result: {
			sectionTitle: '炼成结果',
			privilege: '天选之人',
			progress: '逆袭勇者',
			group: '最强公会',
			lottery: '命运轮盘',
			peopleCount: (count: number) => `${count} 人`
		}
	},
	subjects: {
		chinese: '言灵·语文',
		math: '炼金·数学',
		english: '异邦·英语',
		physics: '奥术·物理',
		chemistry: '魔药·化学',
		biology: '生命·生物'
	}
} as const;
