/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal, createMemo, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { t } from '$lib/i18n';
import { examDataStore } from '$lib/stores/examData';
import {
	generateAllLeaderboards,
	generateCombinedReport,
	sortCombinedReport,
	getDefaultSortDirection,
	type LeaderboardConfig
} from '$lib/stores/useStats';
import { exportStatsToXlsx } from '$lib/statsExport';
import XlsxUploader from '$lib/components/engine/XlsxUploader';
import LeaderboardConfigPanel from '$lib/components/stats/LeaderboardConfigPanel';
import LeaderboardCard from '$lib/components/stats/LeaderboardCard';
import ColumnVisibilityControl from '$lib/components/stats/ColumnVisibilityControl';
import CombinedReportTable from '$lib/components/stats/CombinedReportTable';

const DEFAULT_CONFIGS: LeaderboardConfig[] = [
	{ id: 'school-top-10', dimension: 'schoolRank', topN: 10 },
	{ id: 'class-top-5', dimension: 'classRank', topN: 5 },
	{ id: 'math-top-10', dimension: 'math', topN: 10 },
	{ id: 'progress-top-10', dimension: 'progressScore', topN: 10 }
];

const DEFAULT_VISIBLE_KEYS = [
	'name',
	'group',
	'totalScore',
	'schoolRank',
	'classRank',
	'progressScore',
	'math',
	'chinese',
	'english',
	'leaderboards'
];

/** 数据统计主页面 */
export default function StatsPage() {
	const navigate = useNavigate();
	const i18n = t;

	const [configs, setConfigs] = createSignal<LeaderboardConfig[]>(DEFAULT_CONFIGS);
	const [deduplicate, setDeduplicate] = createSignal(false);
	const [visibleKeys, setVisibleKeys] = createSignal<string[]>(DEFAULT_VISIBLE_KEYS);
	const [sortKey, setSortKey] = createSignal<string>('schoolRank');
	const [sortDirection, setSortDirection] = createSignal<'asc' | 'desc'>('asc');

	const students = () => examDataStore.students();
	const hasData = () => examDataStore.isReady();

	const leaderboards = createMemo(() => {
		if (!hasData()) return [];
		return generateAllLeaderboards(students(), configs());
	});

	const report = createMemo(() => {
		if (!hasData()) return [];
		const raw = generateCombinedReport(students(), leaderboards(), deduplicate());
		return sortCombinedReport(raw, sortKey(), sortDirection());
	});

	function handleSort(key: string) {
		if (sortKey() === key) {
			setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortKey(key);
			setSortDirection(getDefaultSortDirection(key));
		}
	}

	function handleDataReady(data: {
		currentRows: (string | number | null)[][];
		prevRows: (string | number | null)[][];
		fileName: string;
	}) {
		examDataStore.loadData({
			currentRows: data.currentRows,
			prevRows: data.prevRows,
			groupMap: examDataStore.groupMap(),
			fileName: data.fileName
		});
	}

	async function handleExport() {
		if (!hasData()) return;
		const lbs = leaderboards();
		const rep = report();
		const keys = visibleKeys();
		const filename = `stats-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
		await exportStatsToXlsx(lbs, rep, keys, filename);
	}

	return (
		<div class="engine-layout">
			<main class="engine-main">
				<div class="engine-sidebar">
					<div class="sidebar-header">
						<button class="nav-btn" onClick={() => navigate('/')}>
							{i18n().stats.backToHome}
						</button>
						<button class="nav-btn" onClick={() => navigate('/engine')}>
							{i18n().stats.goToEngine}
						</button>
						<span class="sidebar-title">{i18n().stats.pageTitle}</span>
					</div>
					<div class="engine-sidebar-body">
						<XlsxUploader onDataReady={handleDataReady} />
						<Show when={hasData()}>
							<LeaderboardConfigPanel configs={configs()} onChange={setConfigs} />
							<div class="engine-section">
								<div class="engine-section-title">{i18n().stats.combinedReport}</div>
								<label
									style={{
										display: 'flex',
										'align-items': 'center',
										gap: '6px',
										'font-size': '12px',
										cursor: 'pointer'
									}}
								>
									<input
										type="checkbox"
										checked={deduplicate()}
										onChange={(e) => setDeduplicate(e.currentTarget.checked)}
									/>
									{i18n().stats.deduplicate}
								</label>
							</div>
							<ColumnVisibilityControl visibleKeys={visibleKeys()} onChange={setVisibleKeys} />
						</Show>
					</div>
					<div class="engine-sidebar-footer">
						<button class="btn btn-primary" onClick={handleExport} disabled={!hasData()}>
							{i18n().stats.exportXlsx}
						</button>
						<Show when={!hasData()}>
							<p class="error" style={{ 'margin-top': '8px' }}>
								{i18n().stats.noData}
							</p>
						</Show>
						<Show when={hasData()}>
							<div class="meta">
								<span class="meta-label">{i18n().engine.dataReady}</span>
								<span class="meta-value">✓</span>
							</div>
						</Show>
					</div>
				</div>

				<div class="engine-content">
					<Show
						when={hasData()}
						fallback={
							<div
								style={{
									display: 'flex',
									'align-items': 'center',
									'justify-content': 'center',
									height: '100%',
									color: 'var(--text-muted)'
								}}
							>
								{i18n().stats.noData}
							</div>
						}
					>
						<div class="engine-section-title" style={{ 'margin-bottom': '10px' }}>
							{i18n().stats.leaderboards}
						</div>
						<div
							style={{
								display: 'flex',
								'flex-wrap': 'wrap',
								gap: '12px',
								'margin-bottom': '24px'
							}}
						>
							{leaderboards().map((lb) => (
								<LeaderboardCard leaderboard={lb} />
							))}
						</div>

						<div class="engine-section-title" style={{ 'margin-bottom': '10px' }}>
							{i18n().stats.combinedReport}
							<span
								style={{
									'font-size': '12px',
									color: 'var(--text-muted)',
									'font-weight': 400
								}}
							>
								({report().length} 人)
							</span>
						</div>
						<CombinedReportTable
							report={report()}
							visibleKeys={visibleKeys()}
							sortKey={sortKey()}
							sortDirection={sortDirection()}
							onSort={handleSort}
						/>
					</Show>
				</div>
			</main>
		</div>
	);
}
