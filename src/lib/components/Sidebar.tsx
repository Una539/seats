/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { localeStore, t } from '$lib/i18n';
import FileUpload from './FileUpload';
import NameList from './NameList';
import ModeBar from './ModeBar';

interface Props {
	lines: () => string[];
	selectedLine: () => string;
	fileName: () => string;
	error: () => string;
	mode: () => 'fill' | 'remove';
	onFileUpload: (e: Event) => void;
	onRandomFill: () => void;
	onExport: () => void;
	onSelect: (line: string) => void;
	onSetMode: (m: 'fill' | 'remove') => void;
	onToggleLocale: () => void;
}

/**
 * 侧边栏组件。
 * 包含语言切换、模式切换、文件操作及学生名单列表。
 */
export default function Sidebar(props: Props) {
	const i18n = t;

	return (
		<aside class="sidebar">
			<div class="sidebar-header">
				<span class="sidebar-title">{i18n().sidebar.title}</span>
				{/* 语言切换按钮：当前为英文时显示 "中文"，反之显示 "EN" */}
				<button class="lang-toggle" onClick={props.onToggleLocale}>
					{localeStore.locale() === 'en' ? '中文' : 'EN'}
				</button>
			</div>
			<ModeBar mode={props.mode} onSetMode={props.onSetMode} />
			<div class="sidebar-body">
				<FileUpload
					fileName={props.fileName}
					lineCount={() => props.lines().length}
					error={props.error}
					onFileUpload={props.onFileUpload}
					onRandomFill={props.onRandomFill}
					onExport={props.onExport}
				/>
				<NameList lines={props.lines} selectedLine={props.selectedLine} onSelect={props.onSelect} />
			</div>
		</aside>
	);
}
