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

export const en = {
	layout: {
		title: 'Seats',
		subtitle: 'Classroom Seat Assignment Manager'
	},
	modes: {
		fill: 'Fill',
		remove: 'Remove'
	},
	sidebar: {
		title: 'List',
		pending: 'Pending',
		browseFile: 'Browse File',
		randomFill: 'Random Fill',
		exportXlsx: 'Export XLSX'
	},
	grid: {
		aisle: 'Aisle'
	},
	states: {
		empty: 'Empty',
		filled: 'Filled',
		disabled: 'Disabled',
		aisle: 'Aisle'
	},
	usage: {
		assignTitle: 'Assigning Students',
		assignStep1: 'Click a name in the right sidebar list to select it',
		assignStep2: 'Click any empty cell in the grid to assign that student',
		assignStep3: 'The name disappears from the list after assignment',
		swapTitle: 'Swapping Two Students',
		swapStep1: 'In Fill mode, click a filled cell — it highlights as "swap selected"',
		swapStep2: 'Click another filled cell to swap the two students',
		swapStep3: 'A brief flash animation confirms the swap',
		removeTitle: 'Removing a Student',
		removeStep1: 'Switch to Remove mode (red underline indicator)',
		removeStep2: 'Click a filled cell — it turns red to confirm',
		removeStep3: 'Click again to confirm removal; the name returns to the list',
		aisleTitle: 'Managing Aisles',
		aisleStep1: 'Click column buttons above the grid to toggle a column as an aisle',
		aisleStep2: 'Students in that column are displaced back to the list',
		aisleStep3: 'The column button turns dark to indicate aisle status',
		bulkTitle: 'Bulk Enable/Disable Seats',
		bulkDisableStep1: 'In Fill mode with no name selected, click an empty cell to start',
		bulkDisableStep2: 'Click another cell to define a rectangle — all empty cells highlight',
		bulkDisableStep3: 'Click again to confirm and disable all highlighted cells',
		bulkEnableStep1: 'Click a disabled cell to start batch selection',
		bulkEnableStep2: 'Click another cell to define the batch area',
		bulkEnableStep3: 'Click again to confirm and enable all cells'
	}
} as const;
