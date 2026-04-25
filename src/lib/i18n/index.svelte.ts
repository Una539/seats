/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 *
 * seats is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * seats is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with seats. If not, see <https://www.gnu.org/licenses/>.
 */

import { browser } from '$app/environment';
import { en } from './en';
import { cn } from './cn';

export type Locale = 'en' | 'cn';

export interface Translations {
	layout: {
		title: string;
		subtitle: string;
	};
	modes: {
		fill: string;
		remove: string;
	};
	sidebar: {
		title: string;
		pending: string;
		browseFile: string;
		randomFill: string;
		exportXlsx: string;
	};
	grid: {
		aisle: string;
	};
	states: {
		empty: string;
		filled: string;
		disabled: string;
		aisle: string;
	};
	usage: {
		assignTitle: string;
		assignStep1: string;
		assignStep2: string;
		assignStep3: string;
		swapTitle: string;
		swapStep1: string;
		swapStep2: string;
		swapStep3: string;
		removeTitle: string;
		removeStep1: string;
		removeStep2: string;
		removeStep3: string;
		aisleTitle: string;
		aisleStep1: string;
		aisleStep2: string;
		aisleStep3: string;
		bulkTitle: string;
		bulkDisableStep1: string;
		bulkDisableStep2: string;
		bulkDisableStep3: string;
		bulkEnableStep1: string;
		bulkEnableStep2: string;
		bulkEnableStep3: string;
	};
}

const translations: Record<Locale, Translations> = {
	en: en as Translations,
	cn: cn as Translations
};

export function createLocaleStore() {
	let _locale = $state<Locale>('en');

	function init() {
		if (browser) {
			const stored = localStorage.getItem('seats-locale');
			if (stored === 'en' || stored === 'cn') {
				_locale = stored;
			} else {
				const lang = navigator.language.toLowerCase();
				_locale = lang.startsWith('zh') ? 'cn' : 'en';
			}
		}
	}

	function setLocale(newLocale: Locale) {
		_locale = newLocale;
		if (browser) {
			localStorage.setItem('seats-locale', newLocale);
		}
	}

	return {
		get locale() {
			return _locale;
		},
		init,
		setLocale
	};
}

export const localeStore = createLocaleStore();

export function t(): Translations {
	return translations[localeStore.locale];
}

export { en } from './en';
export { cn } from './cn';
export { translations };
