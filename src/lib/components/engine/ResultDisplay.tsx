/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { Show } from 'solid-js';
import { t } from '$lib/i18n';
import type { SeatingResult } from '$lib/stores/seatingEngine';

interface Props {
	result: SeatingResult | null;
}

function BatchCard(props: {
	title: string;
	color: string;
	items: Array<{ name: string; reason: string }>;
}) {
	const i18n = t;
	return (
		<div class="batch-card">
			<div class="batch-header" style={{ 'border-color': props.color }}>
				<span class="batch-title">{props.title}</span>
				<span class="batch-count">{i18n().engine.result.peopleCount(props.items.length)}</span>
			</div>
			<div class="batch-list">
				{props.items.map((item) => (
					<div class="batch-item">
						<span class="batch-name">{item.name}</span>
						<span class="batch-reason">{item.reason}</span>
					</div>
				))}
			</div>
		</div>
	);
}

/** 四批次结果展示组件（2x2 四宫格布局） */
export default function ResultDisplay(props: Props) {
	const i18n = t;
	return (
		<Show when={props.result}>
			{(result) => (
				<div class="engine-result">
					<div class="engine-section-title">{i18n().engine.result.sectionTitle}</div>
					<div class="batch-grid">
						<div class="batch-grid-top">
							<BatchCard
								title={i18n().engine.result.privilege}
								color="var(--accent)"
								items={result().privilegeBatch}
							/>
							<BatchCard
								title={i18n().engine.result.progress}
								color="var(--green-border)"
								items={result().progressBatch}
							/>
						</div>
						<div class="batch-grid-bottom">
							<BatchCard
								title={i18n().engine.result.group}
								color="var(--amber-border)"
								items={result().groupBatch}
							/>
							<BatchCard
								title={i18n().engine.result.lottery}
								color="var(--border-strong)"
								items={result().lotteryBatch}
							/>
						</div>
					</div>
				</div>
			)}
		</Show>
	);
}
