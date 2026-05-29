/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { For } from 'solid-js';
import { t } from '$lib/i18n';
import { getColumnLabel, getAllColumnKeys } from '$lib/statsExport';

interface Props {
	visibleKeys: string[];
	onChange: (keys: string[]) => void;
}

/** 列可见性控制 */
export default function ColumnVisibilityControl(props: Props) {
	const i18n = t;
	const allKeys = getAllColumnKeys();

	function toggleKey(key: string) {
		if (props.visibleKeys.includes(key)) {
			props.onChange(props.visibleKeys.filter((k) => k !== key));
		} else {
			props.onChange([...props.visibleKeys, key]);
		}
	}

	function selectAll() {
		props.onChange([...allKeys]);
	}

	function clearAll() {
		props.onChange([]);
	}

	return (
		<div class="engine-section">
			<div class="engine-section-title">{i18n().stats.columnVisibility}</div>
			<div style={{ display: 'flex', gap: '8px', 'margin-bottom': '8px' }}>
				<button class="btn btn-ghost" style={{ width: 'auto', flex: 1 }} onClick={selectAll}>
					全选
				</button>
				<button class="btn btn-ghost" style={{ width: 'auto', flex: 1 }} onClick={clearAll}>
					全不选
				</button>
			</div>
			<div
				style={{
					display: 'grid',
					'grid-template-columns': 'repeat(2, 1fr)',
					gap: '4px',
					'font-size': '12px'
				}}
			>
				<For each={allKeys}>
					{(key) => (
						<label
							style={{
								display: 'flex',
								'align-items': 'center',
								gap: '4px',
								cursor: 'pointer',
								color: props.visibleKeys.includes(key) ? 'var(--text-primary)' : 'var(--text-muted)'
							}}
						>
							<input
								type="checkbox"
								checked={props.visibleKeys.includes(key)}
								onChange={() => toggleKey(key)}
							/>
							{getColumnLabel(key)}
						</label>
					)}
				</For>
			</div>
		</div>
	);
}
