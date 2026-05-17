/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal, createEffect } from 'solid-js';
import { t } from '$lib/i18n';
import * as ExcelJS from 'exceljs';

interface Props {
	onDataReady: (data: { currentRows: (string | number | null)[][]; prevRows: (string | number | null)[][] }) => void;
}

function sheetToArray(worksheet: ExcelJS.Worksheet): (string | number | null)[][] {
	const rows: (string | number | null)[][] = [];
	worksheet.eachRow((row) => {
		const vals: (string | number | null)[] = [];
		row.eachCell((cell) => {
			vals.push(cell.value as string | number | null);
		});
		rows.push(vals);
	});
	return rows;
}

/** 预览表格组件：只显示姓名和年级排名 */
function PreviewTable(props: { rows: (string | number | null)[][]; title: string }) {
	const i18n = t;
	const previewRows = () => props.rows.slice(1, 5); // 跳过表头，取前4行数据
	return (
		<div class="preview-table-wrap">
			<div class="preview-table-title">{props.title}</div>
			<table class="preview-table">
				<thead>
					<tr>
						<td class="preview-th">{i18n().engine.xlsx.previewStudent}</td>
						<td class="preview-th" style={{ 'text-align': 'right' }}>{i18n().engine.xlsx.previewRank}</td>
					</tr>
				</thead>
				<tbody>
					{previewRows().map((row) => (
						<tr>
							<td>{row[0] ?? ''}</td>
							<td style={{ 'text-align': 'right' }}>{row[2] ?? ''}</td>
						</tr>
					))}
					{props.rows.length > 5 && (
						<tr>
							<td class="preview-ellipsis" colSpan={2}>
								{i18n().engine.xlsx.totalPeople(props.rows.length - 1)}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

/** XLSX 上传组件：上传多 sheet 文件并选择本次/上次考试 */
export default function XlsxUploader(props: Props) {
	const i18n = t;
	const [workbook, setWorkbook] = createSignal<ExcelJS.Workbook | null>(null);
	const [sheetNames, setSheetNames] = createSignal<string[]>([]);
	const [currentSheet, setCurrentSheet] = createSignal('');
	const [prevSheet, setPrevSheet] = createSignal('');
	const [fileName, setFileName] = createSignal('');
	const [error, setError] = createSignal('');
	const [success, setSuccess] = createSignal('');
	const [currentRows, setCurrentRows] = createSignal<(string | number | null)[][]>([]);
	const [prevRows, setPrevRows] = createSignal<(string | number | null)[][]>([]);

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		setFileName(file.name);
		setError('');
		setSuccess('');
		setCurrentSheet('');
		setPrevSheet('');
		setCurrentRows([]);
		setPrevRows([]);

		try {
			const buffer = await file.arrayBuffer();
			const wb = new ExcelJS.Workbook();
			await wb.xlsx.load(buffer);
			setWorkbook(wb);

			const names: string[] = [];
			wb.eachSheet((sheet) => names.push(sheet.name));
			setSheetNames(names);

			if (names.length >= 2) {
				setCurrentSheet(names[0]);
				setPrevSheet(names[1]);
			} else if (names.length === 1) {
				setCurrentSheet(names[0]);
			}
		} catch (err) {
			setError('文件解析失败: ' + (err as Error).message);
			setWorkbook(null);
			setSheetNames([]);
		}
	}

	// 自动处理：当两个 Sheet 都有效且不同时，自动解析数据
	createEffect(() => {
		const wb = workbook();
		const curName = currentSheet();
		const preName = prevSheet();

		if (!wb || !curName || !preName) return;
		if (curName === preName) {
			setError('两次考试不能选择同一个 Sheet');
			setSuccess('');
			setCurrentRows([]);
			setPrevRows([]);
			return;
		}

		const curWs = wb.getWorksheet(curName);
		const preWs = wb.getWorksheet(preName);
		if (!curWs || !preWs) return;

		const curData = sheetToArray(curWs);
		const preData = sheetToArray(preWs);
		setCurrentRows(curData);
		setPrevRows(preData);
		setError('');
		setSuccess(i18n().engine.xlsx.parsed(curName, preName, curData.length - 1));

		props.onDataReady({
			currentRows: curData,
			prevRows: preData
		});
	});

	const hasPreview = () => currentRows().length > 0 && prevRows().length > 0;

	return (
		<div class="engine-section">
			<div class="engine-section-title">{i18n().engine.xlsx.sectionTitle}</div>
			<label class="btn btn-ghost" style={{ width: 'auto', 'justify-content': 'flex-start' }}>
				<span>{i18n().engine.xlsx.uploadBtn}</span>
				<input type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleFileUpload} />
			</label>
			{fileName() && (
				<div class="meta" style={{ 'margin-top': '8px' }}>
					<span class="meta-label">{i18n().engine.xlsx.uploaded}</span>
					<span class="meta-value">{fileName()}</span>
				</div>
			)}
			{sheetNames().length > 0 && (
				<div class="engine-form" style={{ 'margin-top': '12px' }}>
					<div class="engine-field">
						<label>{i18n().engine.xlsx.currentSheet}</label>
						<select class="input" value={currentSheet()} onChange={(e) => setCurrentSheet(e.currentTarget.value)}>
							{sheetNames().map((name) => (
								<option value={name}>{name}</option>
							))}
						</select>
					</div>
					<div class="engine-field">
						<label>{i18n().engine.xlsx.prevSheet}</label>
						<select class="input" value={prevSheet()} onChange={(e) => setPrevSheet(e.currentTarget.value)}>
							{sheetNames().map((name) => (
								<option value={name}>{name}</option>
							))}
						</select>
					</div>
				</div>
			)}
			{success() && <p class="success" style={{ 'margin-top': '8px' }}>{success()}</p>}
			{error() && <p class="error" style={{ 'margin-top': '8px' }}>{error()}</p>}
			{hasPreview() && (
				<div class="preview-section">
					<PreviewTable rows={currentRows()} title={i18n().engine.xlsx.previewCurrent} />
					<PreviewTable rows={prevRows()} title={i18n().engine.xlsx.previewPrev} />
				</div>
			)}
		</div>
	);
}
