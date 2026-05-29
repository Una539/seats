/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { t } from '$lib/i18n';
import { getDimensionLabel, type Leaderboard } from '$lib/stores/useStats';

interface Props {
	leaderboard: Leaderboard;
}

/** 单个榜单结果卡片 */
export default function LeaderboardCard(props: Props) {
	const i18n = t;
	const lb = props.leaderboard;

	return (
		<div class="batch-card" style={{ flex: '1', 'min-width': '260px' }}>
			<div class="batch-header">
				<span class="batch-title">
					{getDimensionLabel(lb.dimension)} Top {lb.topN}
				</span>
				<span class="batch-count">
					{lb.students.length}{' '}
					{i18n()
						.engine.result.peopleCount(lb.students.length)
						.replace(/\d+\s*/, '')}
				</span>
			</div>
			<div class="batch-list">
				{lb.students.length === 0 ? (
					<div style={{ padding: '12px', color: 'var(--text-muted)', 'text-align': 'center' }}>
						{i18n().stats.none}
					</div>
				) : (
					lb.students.map((s, idx) => (
						<div class="batch-item">
							<span class="batch-name" style={{ 'font-family': 'var(--font-mono)' }}>
								{idx + 1}. {s.name}
							</span>
							<span class="batch-reason">
								总分 {s.totalScore} / 年级排名 {s.schoolRank}
							</span>
							<span class="batch-count" style={{ 'flex-shrink': 0 }}>
								第 {s.groupId} {i18n().stats.groupTooltip.includes('小组') ? '小组' : 'Group'}
							</span>
						</div>
					))
				)}
			</div>
		</div>
	);
}
