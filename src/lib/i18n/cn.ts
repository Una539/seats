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
		subtitle: '教室座位分配管理工具'
	},
	modes: {
		fill: '填座',
		remove: '移除'
	},
	sidebar: {
		title: '名单',
		pending: '待分配',
		browseFile: '浏览文件',
		randomFill: '随机填入',
		exportXlsx: '导出 XLSX'
	},
	grid: {
		aisle: '过道'
	},
	states: {
		empty: '空座位',
		filled: '已填充',
		disabled: '已禁用',
		aisle: '过道'
	},
	usage: {
		assignTitle: '分配学生',
		assignStep1: '点击右侧名单中的学生姓名，将其选中',
		assignStep2: '点击网格中任意空单元格，该学生即被分配到该座位',
		assignStep3: '分配成功后，姓名从名单中消失',
		swapTitle: '交换两个学生',
		swapStep1: '在填座模式下，点击已填充单元格 — 该座位高亮显示"交换选中"状态',
		swapStep2: '点击另一个已填充单元格，两位学生互换位置',
		swapStep3: '短暂的闪烁动画确认交换完成',
		removeTitle: '移除学生',
		removeStep1: '切换到移除模式（底部出现红色下划线提示）',
		removeStep2: '点击已填充单元格 — 该座位变红提示确认',
		removeStep3: '再次点击以确认移除，学生姓名回到名单',
		aisleTitle: '管理过道',
		aisleStep1: '点击网格上方的列按钮，可将该列切换为过道',
		aisleStep2: '过道内如有学生，会被自动清退并归还到名单',
		aisleStep3: '列按钮变深色表示该列已设为过道',
		bulkTitle: '批量启用/禁用座位',
		bulkDisableStep1: '在填座模式下且未选中姓名时，点击空单元格开始框选',
		bulkDisableStep2: '点击另一单元格确定矩形范围，所有空单元格高亮',
		bulkDisableStep3: '再次点击确认，将所有高亮单元格设为禁用',
		bulkEnableStep1: '点击已禁用单元格，高亮显示',
		bulkEnableStep2: '点击另一单元格确定范围',
		bulkEnableStep3: '再次点击确认，将所有高亮单元格设为启用'
	}
} as const;
