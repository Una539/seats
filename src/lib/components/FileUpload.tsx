/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { t } from '$lib/i18n';

interface Props {
	fileName: () => string;
	lineCount: () => number;
	error: () => string;
	onFileUpload: (event: Event) => void;
	onRandomFill: () => void;
	onExport: () => void;
}

/**
 * 文件上传与操作按钮组件。
 * 提供浏览 .txt 名单、随机填入、导出 XLSX 的功能入口。
 */
export default function FileUpload(props: Props) {
	const i18n = t;

	return (
		<div class="actions">
			<label class="btn btn-ghost">
				<span>{i18n().sidebar.browseFile}</span>
				<input
					type="file"
					accept=".txt,.json"
					style={{ display: 'none' }}
					onChange={props.onFileUpload}
				/>
			</label>
			<button class="btn btn-primary" onClick={props.onRandomFill}>
				{i18n().sidebar.randomFill}
			</button>
			<button class="btn btn-mid" onClick={props.onExport}>
				{i18n().sidebar.exportXlsx}
			</button>
			{props.fileName() && (
				<p class="meta">
					<span class="meta-label">{i18n().sidebar.pending}</span>
					<span class="meta-value">{props.lineCount()}</span>
				</p>
			)}
			{props.error() && <p class="error">{props.error()}</p>}
		</div>
	);
}
