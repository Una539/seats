/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { useAppState } from '$lib/stores/useAppState';
import ColumnControls from '$lib/components/ColumnControls';
import SeatGrid from '$lib/components/SeatGrid';
import Sidebar from '$lib/components/Sidebar';

/** 座位分配主页，组合主网格与侧边栏 */
export default function HomePage() {
	const state = useAppState();

	return (
		<div class="layout">
			<Sidebar
				lines={state.lines}
				selectedLine={state.selectedLine}
				fileName={state.fileName}
				error={state.error}
				mode={state.mode}
				onFileUpload={state.handleFileUpload}
				onRandomFill={state.handleRandomFill}
				onExport={state.handleExport}
				onSelect={state.selectLine}
				onSetMode={state.setModeSafe}
				onToggleLocale={state.toggleLocale}
			/>
			<main class="main">
				<div class="main-inner">
					<ColumnControls grid={state.grid} onDisplace={state.handleDisplace} />
					<SeatGrid
						grid={state.grid}
						mode={state.mode}
						selectedLine={state.selectedLine}
						onNameReturn={state.handleNameReturn}
						onNameFill={state.handleNameFill}
					/>
				</div>
			</main>
		</div>
	);
}
