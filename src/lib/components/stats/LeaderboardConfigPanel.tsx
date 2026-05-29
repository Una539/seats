/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { For } from 'solid-js';
import { t } from '$lib/i18n';
import {
	getDimensionLabel,
	type RankingDimension,
	type LeaderboardConfig
} from '$lib/stores/useStats';

const allDimensions: RankingDimension[] = [
	'totalScore',
	'schoolRank',
	'classRank',
	'progressScore',
	'chinese',
	'math',
	'english',
	'physics',
	'chemistry',
	'biology'
];

interface Props {
	configs: LeaderboardConfig[];
	onChange: (configs: LeaderboardConfig[]) => void;
}

/** 榜单配置面板：添加/删除/编辑榜单 */
export default function LeaderboardConfigPanel(props: Props) {
	const i18n = t;

	function addConfig() {
		const newConfig: LeaderboardConfig = {
			id: crypto.randomUUID(),
			dimension: 'totalScore',
			topN: 10
		};
		props.onChange([...props.configs, newConfig]);
	}

	function removeConfig(id: string) {
		props.onChange(props.configs.filter((c) => c.id !== id));
	}

	function updateConfig(id: string, updates: Partial<LeaderboardConfig>) {
		props.onChange(props.configs.map((c) => (c.id === id ? { ...c, ...updates } : c)));
	}

	return (
		<div class="engine-section">
			<div class="engine-section-title">{i18n().stats.leaderboards}</div>
			<div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
				<For each={props.configs}>
					{(config) => (
						<div class="leaderboard-config-item">
							<select
								class="input"
								style={{ flex: 1 }}
								value={config.dimension}
								onChange={(e) =>
									updateConfig(config.id, { dimension: e.currentTarget.value as RankingDimension })
								}
							>
								{allDimensions.map((dim) => (
									<option value={dim}>{getDimensionLabel(dim)}</option>
								))}
							</select>
							<span style={{ color: 'var(--text-muted)', 'font-size': '12px' }}>
								{i18n().stats.topN}
							</span>
							<input
								type="number"
								class="input"
								style={{ width: '60px' }}
								min={1}
								value={config.topN}
								onChange={(e) =>
									updateConfig(config.id, {
										topN: Math.max(1, parseInt(e.currentTarget.value, 10) || 1)
									})
								}
							/>
							<button
								class="btn btn-ghost"
								style={{ width: 'auto', 'flex-shrink': 0 }}
								onClick={() => removeConfig(config.id)}
							>
								{i18n().stats.removeLeaderboard}
							</button>
						</div>
					)}
				</For>
				<button class="btn btn-ghost" style={{ width: 'auto' }} onClick={addConfig}>
					{i18n().stats.addLeaderboard}
				</button>
			</div>
		</div>
	);
}
