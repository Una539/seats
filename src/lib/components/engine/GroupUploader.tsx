/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal } from 'solid-js';
import { t } from '$lib/i18n';

interface Props {
	onGroupMapLoaded: (groupMap: Record<string, number>) => void;
}

interface GroupData {
	groups: Array<{ id: number; members: string[] }>;
}

/** 内置默认分组（与 static/groups.json 保持一致） */
const defaultGroupData: GroupData = {
	groups: [
		{
			id: 1,
			members: ['路明非', '路鸣泽', '楚子航', '恺撒', '夏弥', '诺诺', '绘梨衣', '源稚生', '奥丁']
		},
		{
			id: 2,
			members: ['诺顿', '陈墨瞳', '苏小暖', '赵孟华', '古德里安', '弗罗斯特', '瓦尔特', '克里斯蒂娜']
		},
		{
			id: 3,
			members: ['伊莎贝拉', '罗兰', '麦卡伦', '鲍里斯', '叶胜', '酒德亚纪', '酒德麻衣', '零']
		},
		{
			id: 4,
			members: ['雷娜塔', '薇拉', '潘西', '奇兰', '兰斯洛特', '弗拉梅尔', '所罗门', '李元衡', '楚天骄']
		},
		{
			id: 5,
			members: ['苏珊', '艾米丽', '克拉斯', '阿尔萨斯', '高卢', '科赫', '帕西', '希尔伯特', '昂热', '布加迪']
		},
		{
			id: 6,
			members: ['凯撒', '诺言', '源稚女', '上杉绘梨衣', '橘政宗', '樱井小暮', '宫本志雄', '戴安娜']
		}
	]
};

/** 小组名单上传组件 */
export default function GroupUploader(props: Props) {
	const i18n = t;
	const [fileName, setFileName] = createSignal<string>(i18n().engine.groups.defaultSource);
	const [groupCount, setGroupCount] = createSignal(defaultGroupData.groups.length);
	const [error, setError] = createSignal('');
	const [groupData, setGroupData] = createSignal<GroupData>(defaultGroupData);

	// 初始化时直接使用内置默认分组
	loadGroups(defaultGroupData);

	function loadGroups(data: GroupData) {
		const map: Record<string, number> = {};
		let count = 0;
		for (const g of data.groups || []) {
			count++;
			for (const name of g.members || []) {
				map[name.trim()] = g.id;
			}
		}
		setGroupCount(count);
		setGroupData(data);
		props.onGroupMapLoaded(map);
	}

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		setFileName(file.name);
		setError('');
		try {
			const text = await file.text();
			const data: GroupData = JSON.parse(text);
			loadGroups(data);
		} catch (err) {
			setError('JSON 解析失败: ' + (err as Error).message);
			setGroupCount(defaultGroupData.groups.length);
			loadGroups(defaultGroupData);
		}
	}

	return (
		<div class="engine-section">
			<div class="engine-section-title">{i18n().engine.groups.sectionTitle}</div>
			<div class="meta" style={{ 'margin-bottom': '8px' }}>
				<span class="meta-label">{i18n().engine.groups.loaded}</span>
				<span class="meta-value">{i18n().engine.groups.groupCount(groupCount())}</span>
				<span class="meta-label" style={{ 'margin-left': '8px' }}>{i18n().engine.groups.source}</span>
				<span class="meta-value">{fileName()}</span>
			</div>
			<label class="btn btn-ghost" style={{ width: 'auto', 'justify-content': 'flex-start' }}>
				<span>{i18n().engine.groups.uploadBtn}</span>
				<input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileUpload} />
			</label>
			{error() && <p class="error" style={{ 'margin-top': '8px' }}>{error()}</p>}
			<div class="group-preview">
				{groupData().groups.map((g) => (
					<div class="group-preview-item">
						<span class="group-preview-label">{i18n().engine.groups.groupLabel(g.id)}</span>
						<span class="group-preview-members">
							{g.members.slice(0, 4).join('、')}
							{g.members.length > 4 && ` ${i18n().engine.groups.membersEllipsis(g.members.length)}`}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
