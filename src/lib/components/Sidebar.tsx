/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { A } from '@solidjs/router';
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

	function handleToggleLocale() {
		props.onToggleLocale();
	}

	function handleExitOtaku() {
		localeStore.exitOtaku();
	}

	return (
		<aside class="sidebar">
			<div class="sidebar-header">
				<span class="sidebar-title">{i18n().sidebar.title}</span>
				<A href="/engine" class="nav-link">
					{i18n().engine.pageTitle}
				</A>
				<A href="/stats" class="nav-link">
					{i18n().stats.pageTitle}
				</A>
				{localeStore.isOtaku() && (
					<span
						title="退出中二模式"
						onClick={handleExitOtaku}
						style={{
							'font-size': '10px',
							padding: '2px 5px',
							background: 'var(--accent-subtle)',
							color: 'var(--accent)',
							border: '1px solid var(--accent)',
							'border-radius': 'var(--radius-sm)',
							cursor: 'pointer',
							'font-weight': 600
						}}
					>
						中二
					</span>
				)}
				<button class="lang-toggle" onClick={handleToggleLocale}>
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
