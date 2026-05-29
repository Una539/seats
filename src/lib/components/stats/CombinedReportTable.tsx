/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { For } from 'solid-js';
import { t } from '$lib/i18n';
import { getVisibleColumns } from '$lib/statsExport';
import type { Student } from '$lib/stores/seatingEngine';

interface Props {
	report: Array<Student & { leaderboards: string[] }>;
	visibleKeys: string[];
	sortKey: string;
	sortDirection: 'asc' | 'desc';
	onSort: (key: string) => void;
}

/** 判断列是否应右对齐（数字类） */
function isRightAligned(key: string): boolean {
	if (key === 'name' || key === 'leaderboards') return false;
	return true;
}

/** 汇总成绩单表格，支持表头点击排序 */
export default function CombinedReportTable(props: Props) {
	const i18n = t;
	const columns = () => getVisibleColumns(props.visibleKeys);

	function getSortArrow(key: string): string {
		if (props.sortKey !== key) return '';
		return props.sortDirection === 'asc' ? ' ▲' : ' ▼';
	}

	return (
		<div class="engine-section" style={{ padding: 0, overflow: 'hidden' }}>
			<div class="stats-table-wrap">
				<table class="stats-table">
					<thead>
						<tr>
							<For each={columns()}>
								{(col) => (
									<th
										class="stats-th"
										classList={{ 'sort-active': props.sortKey === col.key }}
										onClick={() => props.onSort(col.key)}
										style={{
											'text-align': isRightAligned(col.key) ? 'right' : 'left',
											cursor: 'pointer',
											'user-select': 'none'
										}}
									>
										{col.label}
										<span class="sort-arrow">{getSortArrow(col.key)}</span>
									</th>
								)}
							</For>
						</tr>
					</thead>
					<tbody>
						<For each={props.report}>
							{(row) => (
								<tr>
									<For each={columns()}>
										{(col) => {
											const raw = col.getter(row);
											const display = col.key === 'group' ? `第 ${String(raw)} 小组` : String(raw);
											return (
												<td
													style={{
														'text-align': isRightAligned(col.key) ? 'right' : 'left'
													}}
													title={col.key === 'group' ? i18n().stats.groupTooltip : undefined}
												>
													{display}
												</td>
											);
										}}
									</For>
								</tr>
							)}
						</For>
					</tbody>
				</table>
			</div>
		</div>
	);
}
