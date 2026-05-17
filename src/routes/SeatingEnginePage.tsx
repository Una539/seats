/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { t } from '$lib/i18n';
import {
	buildStudentData,
	generateSeatingArrangement,
	flattenSeatingResultWithDividers,
	saveResultToStorage,
	exportResultToJSON,
	exportResultToTXT,
	DefaultSeatingConfig,
	type SeatingConfig,
	type SeatingResult
} from '$lib/stores/seatingEngine';
import XlsxUploader from '$lib/components/engine/XlsxUploader';
import GroupUploader from '$lib/components/engine/GroupUploader';
import ConfigPanel from '$lib/components/engine/ConfigPanel';
import PenaltySelector from '$lib/components/engine/PenaltySelector';
import ResultDisplay from '$lib/components/engine/ResultDisplay';

/** 排座引擎主页面 */
export default function SeatingEnginePage() {
	const navigate = useNavigate();
	const i18n = t;

	const [currentRows, setCurrentRows] = createSignal<(string | number | null)[][]>([]);
	const [prevRows, setPrevRows] = createSignal<(string | number | null)[][]>([]);
	const [groupMap, setGroupMap] = createSignal<Record<string, number>>({});
	const [config, setConfig] = createSignal<SeatingConfig>(DefaultSeatingConfig);
	const [result, setResult] = createSignal<SeatingResult | null>(null);
	const [error, setError] = createSignal('');
	const [dataReady, setDataReady] = createSignal(false);
	const [excludedNames, setExcludedNames] = createSignal<string[]>([]);
	const [studentNames, setStudentNames] = createSignal<string[]>([]);

	function extractStudentNames(rows: (string | number | null)[][]): string[] {
		const names: string[] = [];
		for (let i = 1; i < rows.length; i++) {
			const row = rows[i];
			if (!row || row.length === 0) continue;
			const name = String(row[0] ?? '').trim();
			if (name) names.push(name);
		}
		return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'zh-CN'));
	}

	function handleDataReady(data: {
		currentRows: (string | number | null)[][];
		prevRows: (string | number | null)[][];
	}) {
		setCurrentRows(data.currentRows);
		setPrevRows(data.prevRows);
		setDataReady(true);
		setError('');
		setResult(null);
		setExcludedNames([]);
		setStudentNames(extractStudentNames(data.currentRows));
	}

	function handleRun() {
		if (!dataReady()) {
			setError(i18n().engine.errors.noFile);
			return;
		}
		try {
			const students = buildStudentData(currentRows(), prevRows(), groupMap());
			if (students.length === 0) {
				setError(i18n().engine.errors.noStudents);
				return;
			}
			const res = generateSeatingArrangement(students, config(), new Set(excludedNames()));
			setResult(res);
			setError('');
		} catch (err) {
			setError(i18n().engine.errors.calcFailed + (err as Error).message);
		}
	}

	return (
		<div class="engine-layout">
			<main class="engine-main">
				<div class="engine-sidebar">
					<div class="sidebar-header">
						<button class="nav-btn" onClick={() => navigate('/')}>
							{i18n().engine.backToHome}
						</button>
						<span class="sidebar-title">{i18n().engine.pageTitle}</span>
					</div>
					<div class="engine-sidebar-body">
						<XlsxUploader onDataReady={handleDataReady} />
						<GroupUploader onGroupMapLoaded={setGroupMap} />
						<ConfigPanel config={config()} onChange={setConfig} />
						{dataReady() && studentNames().length > 0 && (
							<PenaltySelector
								studentNames={studentNames()}
								selected={excludedNames()}
								onChange={setExcludedNames}
							/>
						)}
					</div>
					<div class="engine-sidebar-footer">
						<button class="btn btn-primary" onClick={handleRun}>
							{i18n().engine.run}
						</button>
						{error() && <p class="error">{error()}</p>}
						{dataReady() && (
							<div class="meta">
								<span class="meta-label">{i18n().engine.dataReady}</span>
								<span class="meta-value">✓</span>
							</div>
						)}
					</div>
				</div>

				<div class="engine-content">
					<ResultDisplay result={result()} />
					{result() && (
						<div
							style={{
								'margin-top': '16px',
								display: 'flex',
								gap: '12px',
								'align-self': 'flex-start'
							}}
						>
							<button
								class="btn btn-primary"
								onClick={() => {
									const names = flattenSeatingResultWithDividers(result()!);
									saveResultToStorage(names);
									navigate('/');
								}}
							>
								{i18n().engine.actions.importToSeats}
							</button>
							<button
								class="btn btn-mid"
								onClick={() => {
									const json = exportResultToJSON(result()!);
									const blob = new Blob([json], { type: 'application/json' });
									const url = URL.createObjectURL(blob);
									const a = document.createElement('a');
									a.href = url;
									a.download = `alchemy-result-${new Date().toISOString().slice(0, 10)}.json`;
									a.click();
									URL.revokeObjectURL(url);
								}}
							>
								{i18n().engine.actions.downloadJSON}
							</button>
							<button
								class="btn btn-mid"
								onClick={() => {
									const txt = exportResultToTXT(result()!);
									const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
									const url = URL.createObjectURL(blob);
									const a = document.createElement('a');
									a.href = url;
									a.download = `alchemy-result-${new Date().toISOString().slice(0, 10)}.txt`;
									a.click();
									URL.revokeObjectURL(url);
								}}
							>
								{i18n().engine.actions.downloadTXT}
							</button>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
