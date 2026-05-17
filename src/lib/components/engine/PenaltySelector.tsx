/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal } from 'solid-js';
import { t } from '$lib/i18n';

interface Props {
	studentNames: string[];
	selected: string[];
	onChange: (selected: string[]) => void;
}

/** 惩罚名单选择器：从学生列表中点选受惩罚者 */
export default function PenaltySelector(props: Props) {
	const i18n = t;
	const [search, setSearch] = createSignal('');

	const filteredNames = () => {
		const q = search().trim();
		if (!q) return props.studentNames;
		return props.studentNames.filter((name) => name.includes(q));
	};

	function toggleName(name: string) {
		const idx = props.selected.indexOf(name);
		if (idx >= 0) {
			props.onChange(props.selected.filter((_, i) => i !== idx));
		} else {
			props.onChange([...props.selected, name]);
		}
	}

	return (
		<div class="engine-section">
			<div class="engine-section-title">{i18n().engine.penalty.sectionTitle}</div>
			<div class="engine-field" style={{ 'margin-bottom': '8px' }}>
				<input
					type="text"
					class="input"
					placeholder={i18n().engine.penalty.searchPlaceholder}
					value={search()}
					onInput={(e) => setSearch(e.currentTarget.value)}
				/>
			</div>
			<div class="penalty-list">
				{filteredNames().map((name) => (
					<label class="penalty-item">
						<input
							type="checkbox"
							checked={props.selected.includes(name)}
							onChange={() => toggleName(name)}
						/>
						<span>{name}</span>
					</label>
				))}
			</div>
			<div class="meta" style={{ 'margin-top': '8px' }}>
				<span class="meta-label">
					{i18n().engine.penalty.selectedCount(props.selected.length)}
				</span>
			</div>
		</div>
	);
}
