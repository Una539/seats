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

/** 英文语言包 (普通模式) */
export const en = {
	layout: {
		title: 'Seats',
		subtitle: 'Classroom Seat Arrangement Tool'
	},
	modes: {
		fill: 'Sit Down',
		remove: 'Remove'
	},
	sidebar: {
		title: 'Students to Assign',
		pending: 'Pending',
		browseFile: 'Student List',
		randomFill: '🎲 Random Assign',
		exportXlsx: 'Export XLSX'
	},
	grid: {
		aisle: 'Aisle'
	},
	usage: {
		assignTitle: 'Assigning Students',
		assignStep1: 'Click a student name in the right sidebar to select them',
		assignStep2: 'Click any vacant seat to assign that student',
		assignStep3: 'The name vanishes from the list after assignment',
		swapTitle: 'Swapping Two Students',
		swapStep1: 'In Sit Down mode, click an occupied seat — it highlights as "swap selected"',
		swapStep2: 'Click another occupied seat to swap the two students',
		swapStep3: 'A brief flash confirms the swap',
		removeTitle: 'Removing a Student',
		removeStep1: 'Switch to Remove mode (red underline indicator)',
		removeStep2: 'Click an occupied seat — it turns red to confirm',
		removeStep3: 'Click again to confirm removal; the name returns to the list',
		aisleTitle: 'Managing Aisles',
		aisleStep1: 'Click column buttons above the grid to toggle a column as an aisle',
		aisleStep2: 'Students in that column are displaced back to the list',
		aisleStep3: 'The column button turns dark to indicate aisle status',
		bulkTitle: 'Bulk Disable/Enable Seats',
		bulkDisableStep1: 'In Sit Down mode with no student selected, click a vacant seat to start',
		bulkDisableStep2: 'Click another seat to define a rectangle — all vacant seats highlight',
		bulkDisableStep3: 'Click again to disable all highlighted cells',
		bulkEnableStep1: 'Click a disabled cell to start batch selection',
		bulkEnableStep2: 'Click another seat to define the batch area',
		bulkEnableStep3: 'Click again to enable all cells'
	},
	engine: {
		pageTitle: 'Seating Engine',
		backToHome: '← Back to Seat Arranger',
		run: '🔮 Run Seating Engine',
		dataReady: 'Data Ready',
		errors: {
			noFile: 'Please upload exam data first',
			noStudents: 'No valid students detected. Check the data format.',
			calcFailed: 'Seating failed: '
		},
		actions: {
			importToSeats: 'Import result to Seat Arranger',
			downloadJSON: 'Download config (.json)',
			downloadTXT: 'Export report (.txt)'
		},
		xlsx: {
			sectionTitle: 'Exam Data',
			uploadBtn: 'Upload data file',
			uploaded: 'File uploaded',
			currentSheet: 'Current Exam Sheet',
			prevSheet: 'Previous Exam Sheet',
			parsed: (cur: string, prev: string, count: number) =>
				`Parsed ${cur} & ${prev}, ${count} students total`,
			previewCurrent: 'Current Exam Preview',
			previewPrev: 'Previous Exam Preview',
			previewStudent: 'Student',
			previewRank: 'Grade Rank',
			totalPeople: (count: number) => `${count} total`
		},
		groups: {
			sectionTitle: 'Group Registry',
			loaded: 'Loaded',
			groupCount: (count: number) => `${count} Groups`,
			source: 'Source',
			defaultSource: 'Default Groups',
			uploadBtn: 'Upload custom group registry',
			groupLabel: (id: number) => `Group ${id}`,
			membersEllipsis: (count: number) => `and ${count} others`
		},
		config: {
			sectionTitle: 'Engine Rules',
			resetDefaults: 'Reset Defaults',
			classTopN: 'Class Elite Top N',
			mathSchoolTopN: 'Math Grade Top N',
			mathScoreThreshold: 'Math Score Threshold',
			subjectQuota: 'Subject Privilege Quota',
			progressMode: 'Progress Mode',
			progressModeAll: 'All Progress',
			progressModeTopN: 'Top N Progress',
			progressTopN: 'Progress Top N',
			weightsToggle: 'Score Weight Config',
			rank401Plus: '401+ per rank up',
			rank201Plus: '201-400 per rank up',
			rank101Plus: '101-200 per rank up',
			rank11Plus: '11-100 per rank up',
			rank6Plus: '6-10 per rank up',
			rank1To5: '1-5 per rank up'
		},
		penalty: {
			sectionTitle: 'Exclusion List',
			searchPlaceholder: 'Search names...',
			selectedCount: (count: number) => `${count} selected`
		},
		result: {
			sectionTitle: 'Result',
			privilege: 'Privilege Batch',
			progress: 'Progress Batch',
			group: 'Group Batch',
			lottery: 'Lottery Batch',
			peopleCount: (count: number) => `${count} students`,
			excludedReason: 'Excluded: Penalized'
		}
	},
	stats: {
		pageTitle: 'Statistics',
		backToHome: '← Back to Seat Arranger',
		goToEngine: '→ Seating Engine',
		uploadData: 'Exam Data',
		leaderboards: 'Leaderboards',
		combinedReport: 'Combined Report',
		exportXlsx: 'Export Statistics',
		deduplicate: 'Deduplicate (same student only kept once across boards)',
		columnVisibility: 'Display Columns',
		dimensions: {
			totalScore: 'Total Score',
			schoolRank: 'Grade Rank',
			classRank: 'Class Rank',
			progressScore: 'Progress Score',
			chinese: 'Chinese',
			math: 'Math',
			english: 'English',
			physics: 'Physics',
			chemistry: 'Chemistry',
			biology: 'Biology'
		},
		addLeaderboard: '+ Add Leaderboard',
		removeLeaderboard: 'Remove',
		topN: 'Top N',
		noData: 'Please upload exam data to view statistics',
		groupTooltip: 'The study group ID this student belongs to',
		onlyLeaderboard: 'Board Only',
		withLeaderboard: 'With Board Tag',
		none: 'None'
	},
	subjects: {
		chinese: 'Chinese',
		math: 'Math',
		english: 'English',
		physics: 'Physics',
		chemistry: 'Chemistry',
		biology: 'Biology'
	}
} as const;
