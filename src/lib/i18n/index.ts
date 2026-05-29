/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 */

import { createSignal } from 'solid-js';
import { en } from './en';
import { cn } from './cn';
import { otakuEn } from './otaku_en';
import { otakuCn } from './otaku_cn';

/** 支持的语言代码 */
export type Locale = 'en' | 'cn';
export type Translations = typeof en;

/** 语言包映射表 */
const translations = { en, cn };
const otakuTranslations = { en: otakuEn, cn: otakuCn };

const OTAKU_STORAGE_KEY = 'seats-otaku';
const OTAKU_COUNT_KEY = 'seats-otaku-switch-count';
const OTAKU_TRIGGER_COUNT = 6; // 中↔英 切 3 次 = 6 次切换

/**
 * 创建语言状态存储。
 * 自动从 localStorage 或浏览器语言推断默认语言。
 * 彩蛋：连续切换语言 3 次后激活中二模式。
 */
function createLocaleStore() {
	const [locale, setLocaleSignal] = createSignal<Locale>('en');
	const [isOtaku, setIsOtaku] = createSignal(false);

	/** 初始化语言与中二状态 */
	function init() {
		const stored = localStorage.getItem('seats-locale');
		if (stored === 'en' || stored === 'cn') {
			setLocaleSignal(stored);
		} else {
			setLocaleSignal(navigator.language.toLowerCase().startsWith('zh') ? 'cn' : 'en');
		}

		const otakuStored = localStorage.getItem(OTAKU_STORAGE_KEY);
		if (otakuStored === 'true') {
			setIsOtaku(true);
		}
	}

	/** 切换语言并持久化到 localStorage，同时累计彩蛋计数 */
	function setLocale(newLocale: Locale) {
		setLocaleSignal(newLocale);
		localStorage.setItem('seats-locale', newLocale);

		// 彩蛋逻辑：每次切换语言累计计数
		if (!isOtaku()) {
			const raw = localStorage.getItem(OTAKU_COUNT_KEY);
			let count = raw ? parseInt(raw, 10) : 0;
			if (isNaN(count)) count = 0;
			count += 1;
			localStorage.setItem(OTAKU_COUNT_KEY, String(count));

			if (count >= OTAKU_TRIGGER_COUNT) {
				setIsOtaku(true);
				localStorage.setItem(OTAKU_STORAGE_KEY, 'true');
				localStorage.removeItem(OTAKU_COUNT_KEY);
				setTimeout(() => {
					alert('🎉 中二模式已激活！');
				}, 0);
			}
		}
	}

	/** 退出中二模式（彩蛋关闭） */
	function exitOtaku() {
		setIsOtaku(false);
		localStorage.removeItem(OTAKU_STORAGE_KEY);
		localStorage.removeItem(OTAKU_COUNT_KEY);
	}

	return { locale, setLocale, init, isOtaku, exitOtaku };
}

export const localeStore = createLocaleStore();

/** 响应式获取当前语言对应的翻译文本（支持彩蛋） */
export const t = () => {
	const l = localeStore.locale();
	if (localeStore.isOtaku()) {
		return otakuTranslations[l] as unknown as Translations;
	}
	return translations[l] as unknown as Translations;
};
export { en, cn, translations };
