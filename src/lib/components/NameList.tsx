/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { isDivider } from '$lib/stores/seatingEngine';

interface Props {
	lines: () => string[];
	selectedLine: () => string;
	onSelect: (line: string) => void;
}

/**
 * 学生名单列表组件。
 * 展示从文件中读取的待分配姓名，点击可选中该姓名以分配到座位。
 * 支持渲染引擎结果的分隔符（不可点击）。
 */
export default function NameList(props: Props) {
	return (
		<>
			{props.lines().length > 0 && (
				<div class="list">
					{props.lines().map((line) =>
						isDivider(line) ? (
							<div class="list-divider">{line}</div>
						) : (
							<button
								class={props.selectedLine() === line ? 'selected' : ''}
								onClick={() => props.onSelect(line)}
							>
								{line}
							</button>
						)
					)}
				</div>
			)}
		</>
	);
}
