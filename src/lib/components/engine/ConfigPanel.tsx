/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal, Show } from 'solid-js';
import { t } from '$lib/i18n';
import {
	DefaultSeatingConfig,
	type SeatingConfig,
	type ProgressWeights
} from '$lib/stores/seatingEngine';

interface Props {
	config: SeatingConfig;
	onChange: (config: SeatingConfig) => void;
}

function NumberInput(props: {
	label: string;
	value: number;
	onChange: (v: number) => void;
	min?: number;
}) {
	return (
		<div class="engine-field">
			<label>{props.label}</label>
			<input
				type="number"
				class="input"
				min={props.min ?? 0}
				value={props.value}
				onInput={(e) => props.onChange(Number(e.currentTarget.value))}
			/>
		</div>
	);
}

/** 排座参数配置面板 */
export default function ConfigPanel(props: Props) {
	const i18n = t;
	const [weightsOpen, setWeightsOpen] = createSignal(false);

	function updateConfig(partial: Partial<SeatingConfig>) {
		props.onChange({ ...props.config, ...partial });
	}

	function updateWeights(partial: Partial<ProgressWeights>) {
		props.onChange({
			...props.config,
			progressWeights: { ...props.config.progressWeights, ...partial }
		});
	}

	function resetDefaults() {
		props.onChange(DefaultSeatingConfig);
	}

	return (
		<div class="engine-section">
			<div class="engine-section-title">
				{i18n().engine.config.sectionTitle}
				<button class="btn btn-ghost" style={{ width: 'auto', padding: '2px 6px', 'font-size': '11px' }} onClick={resetDefaults}>
					{i18n().engine.config.resetDefaults}
				</button>
			</div>
			<div class="engine-form">
				<NumberInput
					label={i18n().engine.config.classTopN}
					value={props.config.privilegeClassTopN}
					onChange={(v) => updateConfig({ privilegeClassTopN: v })}
				/>
				<NumberInput
					label={i18n().engine.config.mathSchoolTopN}
					value={props.config.privilegeMathSchoolTopN}
					onChange={(v) => updateConfig({ privilegeMathSchoolTopN: v })}
				/>
				<NumberInput
					label={i18n().engine.config.mathScoreThreshold}
					value={props.config.privilegeMathScoreThreshold}
					onChange={(v) => updateConfig({ privilegeMathScoreThreshold: v })}
				/>
				<NumberInput
					label={i18n().engine.config.subjectQuota}
					value={props.config.subjectPrivilegeQuota}
					onChange={(v) => updateConfig({ subjectPrivilegeQuota: v })}
				/>
				<div class="engine-field">
					<label>{i18n().engine.config.progressMode}</label>
					<div class="engine-radio-group">
						<label class="engine-radio">
							<input
								type="radio"
								name="progressMode"
								checked={props.config.progressMode === 'all'}
								onChange={() => updateConfig({ progressMode: 'all' })}
							/>
							<span>{i18n().engine.config.progressModeAll}</span>
						</label>
						<label class="engine-radio">
							<input
								type="radio"
								name="progressMode"
								checked={props.config.progressMode === 'topN'}
								onChange={() => updateConfig({ progressMode: 'topN' })}
							/>
							<span>{i18n().engine.config.progressModeTopN}</span>
						</label>
					</div>
				</div>
				<Show when={props.config.progressMode === 'topN'}>
					<NumberInput
						label={i18n().engine.config.progressTopN}
						value={props.config.progressTopN}
						onChange={(v) => updateConfig({ progressTopN: v })}
					/>
				</Show>
			</div>

			<div class="engine-weights">
				<button class="engine-weights-toggle" onClick={() => setWeightsOpen(!weightsOpen())}>
					{i18n().engine.config.weightsToggle} {weightsOpen() ? '▲' : '▼'}
				</button>
				<Show when={weightsOpen()}>
					<div class="engine-form" style={{ 'margin-top': '8px' }}>
						<NumberInput
							label={i18n().engine.config.rank401Plus}
							value={props.config.progressWeights.rank401Plus}
							onChange={(v) => updateWeights({ rank401Plus: v })}
						/>
						<NumberInput
							label={i18n().engine.config.rank201Plus}
							value={props.config.progressWeights.rank201Plus}
							onChange={(v) => updateWeights({ rank201Plus: v })}
						/>
						<NumberInput
							label={i18n().engine.config.rank101Plus}
							value={props.config.progressWeights.rank101Plus}
							onChange={(v) => updateWeights({ rank101Plus: v })}
						/>
						<NumberInput
							label={i18n().engine.config.rank11Plus}
							value={props.config.progressWeights.rank11Plus}
							onChange={(v) => updateWeights({ rank11Plus: v })}
						/>
						<NumberInput
							label={i18n().engine.config.rank6Plus}
							value={props.config.progressWeights.rank6Plus}
							onChange={(v) => updateWeights({ rank6Plus: v })}
						/>
						<NumberInput
							label={i18n().engine.config.rank1To5}
							value={props.config.progressWeights.rank1To5}
							onChange={(v) => updateWeights({ rank1To5: v })}
						/>
					</div>
				</Show>
			</div>
		</div>
	);
}
