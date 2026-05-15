/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal } from 'solid-js';
import { en } from './en';
import { cn } from './cn';

/** 支持的语言代码 */
export type Locale = 'en' | 'cn';
export type Translations = typeof en;

type EnTranslations = typeof en;
type CnTranslations = typeof cn;

/** 语言包映射表 */
const translations: Record<Locale, EnTranslations | CnTranslations> = { en, cn };

/**
 * 创建语言状态存储。
 * 自动从 localStorage 或浏览器语言推断默认语言。
 */
function createLocaleStore() {
	const [locale, setLocaleSignal] = createSignal<Locale>('en');

	/** 初始化语言：优先读取本地缓存，其次根据系统语言判断 */
	function init() {
		const stored = localStorage.getItem('seats-locale');
		if (stored === 'en' || stored === 'cn') {
			setLocaleSignal(stored);
		} else {
			setLocaleSignal(navigator.language.toLowerCase().startsWith('zh') ? 'cn' : 'en');
		}
	}

	/** 切换语言并持久化到 localStorage */
	function setLocale(newLocale: Locale) {
		setLocaleSignal(newLocale);
		localStorage.setItem('seats-locale', newLocale);
	}

	return { locale, setLocale, init };
}

export const localeStore = createLocaleStore();
/** 响应式获取当前语言对应的翻译文本 */
export const t = () => translations[localeStore.locale()] as EnTranslations;
export { en, cn, translations };
