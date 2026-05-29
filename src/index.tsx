/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { render } from 'solid-js/web';
import App from './App';
import { localeStore } from '$lib/i18n';
import './app.css';

localeStore.init();

// 获取 DOM 挂载点并渲染 SolidJS 根组件
const root = document.getElementById('root');
if (root) render(() => <App />, root);
