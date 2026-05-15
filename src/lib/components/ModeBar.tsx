/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { t } from '$lib/i18n';

interface Props {
	mode: () => 'fill' | 'remove';
	onSetMode: (m: 'fill' | 'remove') => void;
}

/**
 * 模式切换栏。
 * 提供 "填座" 与 "移除" 两种操作模式的切换按钮。
 */
export default function ModeBar(props: Props) {
	const i18n = t;

	return (
		<div class="mode-bar">
			<button
				class={`mode-btn${props.mode() === 'fill' ? ' active' : ''}`}
				onClick={() => props.onSetMode('fill')}
			>
				{i18n().modes.fill}
			</button>
			<button
				class={`mode-btn mode-btn-remove${props.mode() === 'remove' ? ' active' : ''}`}
				onClick={() => props.onSetMode('remove')}
			>
				{i18n().modes.remove}
			</button>
		</div>
	);
}
