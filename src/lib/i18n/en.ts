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

/** 英文语言包 */
export const en = {
	layout: {
		title: 'Seats',
		subtitle: 'Classroom Seat Transmutation System'
	},
	modes: {
		fill: 'Sit Down',
		remove: 'Yeet'
	},
	sidebar: {
		title: 'Warriors to Summon',
		pending: 'Awaiting Summon',
		browseFile: 'Summon List',
		randomFill: '🎲 Random Summon',
		exportXlsx: 'Export XLSX'
	},
	grid: {
		aisle: 'Aisle'
	},
	usage: {
		assignTitle: 'Assigning Warriors',
		assignStep1: 'Click a warrior name in the right sidebar to select them',
		assignStep2: 'Click any vacant seat to assign that warrior',
		assignStep3: 'The name vanishes from the list after summoning',
		swapTitle: 'Swapping Two Warriors',
		swapStep1: 'In Sit Down mode, click an occupied seat — it highlights as "swap selected"',
		swapStep2: 'Click another occupied seat to swap the two warriors',
		swapStep3: 'A brief flash confirms the transmutation',
		removeTitle: 'Yeeting a Warrior',
		removeStep1: 'Switch to Yeet mode (red underline indicator)',
		removeStep2: 'Click an occupied seat — it turns red to confirm',
		removeStep3: 'Click again to confirm yeeting; the name returns to the list',
		aisleTitle: 'Managing Aisles',
		aisleStep1: 'Click column buttons above the grid to toggle a column as an aisle',
		aisleStep2: 'Warriors in that column are displaced back to the list',
		aisleStep3: 'The column button turns dark to indicate aisle status',
		bulkTitle: 'Bulk Seal/Unseal Seats',
		bulkDisableStep1: 'In Sit Down mode with no warrior selected, click a vacant seat to start',
		bulkDisableStep2: 'Click another seat to define a rectangle — all vacant seats highlight',
		bulkDisableStep3: 'Click again to seal all highlighted cells',
		bulkEnableStep1: 'Click a sealed cell to start batch selection',
		bulkEnableStep2: 'Click another seat to define the batch area',
		bulkEnableStep3: 'Click again to unseal all cells'
	},
	engine: {
		pageTitle: 'Seat Transmutation Altar',
		backToHome: '← Back to Seat Arranger',
		run: '🔮 Activate Transmutation!',
		dataReady: 'Materials Ready',
		errors: {
			noFile: 'Please upload the transmutation materials first',
			noStudents: 'No summonable warriors detected. Check your recipe.',
			calcFailed: 'Transmutation failed: '
		},
		actions: {
			importToSeats: 'Import result to Seat Arranger',
			downloadJSON: 'Download Alchemy Recipe (.json)',
			downloadTXT: 'Export Readable Report (.txt)'
		},
		xlsx: {
			sectionTitle: 'Alchemy Materials',
			uploadBtn: 'Upload Recipe Book',
			uploaded: 'Recipe Logged',
			currentSheet: 'Current Trial Sheet',
			prevSheet: 'Previous Trial Sheet',
			parsed: (cur: string, prev: string, count: number) =>
				`Parsed ${cur} & ${prev}, ${count} warriors total`,
			previewCurrent: 'Current Trial Preview',
			previewPrev: 'Previous Trial Preview',
			previewStudent: 'Warrior',
			previewRank: 'Server Rank',
			totalPeople: (count: number) => `${count} warriors total`
		},
		groups: {
			sectionTitle: 'Guild Registry',
			loaded: 'Assembled',
			groupCount: (count: number) => `${count} Guilds`,
			source: 'Source',
			defaultSource: 'Default Guilds',
			uploadBtn: 'Upload Custom Guild Registry',
			groupLabel: (id: number) => `Guild ${id}`,
			membersEllipsis: (count: number) => `and ${count} others`
		},
		config: {
			sectionTitle: 'Alchemy Rules',
			resetDefaults: 'Reset Recipe',
			classTopN: 'Guild Elite Top N',
			mathSchoolTopN: 'Alchemy: Math Server Top N',
			mathScoreThreshold: 'Alchemy: Math Threshold',
			subjectQuota: 'School Privilege Quota',
			progressMode: 'Comeback Mode',
			progressModeAll: 'All Comebacks',
			progressModeTopN: 'Top N Comebacks',
			progressTopN: 'Comeback Top N',
			weightsToggle: 'Score Weight Recipe',
			rank401Plus: '401+ per rank up',
			rank201Plus: '201-400 per rank up',
			rank101Plus: '101-200 per rank up',
			rank11Plus: '11-100 per rank up',
			rank6Plus: '6-10 per rank up',
			rank1To5: '1-5 per rank up'
		},
		penalty: {
			sectionTitle: 'Exile List',
			searchPlaceholder: 'Search names...',
			selectedCount: (count: number) => `${count} selected`
		},
		result: {
			sectionTitle: 'Transmutation Result',
			privilege: 'The Chosen',
			progress: 'Comeback Heroes',
			group: 'Strongest Guild',
			lottery: 'Wheel of Fate',
			peopleCount: (count: number) => `${count} warriors`,
			excludedReason: 'Exiled: Under Punishment'
		}
	},
	subjects: {
		chinese: 'Verbal Arts: Chinese',
		math: 'Alchemy: Math',
		english: 'Foreign Tongue: English',
		physics: 'Arcane: Physics',
		chemistry: 'Potions: Chemistry',
		biology: 'Life: Biology'
	}
} as const;
