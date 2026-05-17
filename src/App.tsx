/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { Router, Route } from '@solidjs/router';
import HomePage from './routes/HomePage';
import SeatingEnginePage from './routes/SeatingEnginePage';

/** 应用根组件，配置路由 */
export default function App() {
	return (
		<Router>
			<Route path="/" component={HomePage} />
			<Route path="/engine" component={SeatingEnginePage} />
		</Router>
	);
}
