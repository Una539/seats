/*
 * Copyright (C) 2026 Una
 *
 * This file is part of seats.
 *
 * seats is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * seats is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with seats. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * i18n 国际化功能测试
 * 测试中英文切换、翻译正确性、localStorage持久化
 */

// ============================================================
// 翻译数据（从源文件复制）
// ============================================================

const cn = {
	layout: {
		title: 'Seats',
		subtitle: '教室座位分配管理工具'
	},
	modes: {
		fill: '填座',
		remove: '移除'
	},
	sidebar: {
		title: '名单',
		pending: '待分配',
		browseFile: '浏览文件',
		randomFill: '随机填入',
		exportXlsx: '导出 XLSX'
	},
	grid: {
		aisle: '过道'
	},
	states: {
		empty: '空座位',
		filled: '已填充',
		disabled: '已禁用',
		aisle: '过道'
	},
	usage: {
		assignTitle: '分配学生',
		assignStep1: '点击右侧名单中的学生姓名，将其选中',
		assignStep2: '点击网格中任意空单元格，该学生即被分配到该座位',
		assignStep3: '分配成功后，姓名从名单中消失',
		swapTitle: '交换两个学生',
		swapStep1: '在填座模式下，点击已填充单元格 — 该座位高亮显示"交换选中"状态',
		swapStep2: '点击另一个已填充单元格，两位学生互换位置',
		swapStep3: '短暂的闪烁动画确认交换完成',
		removeTitle: '移除学生',
		removeStep1: '切换到移除模式（底部出现红色下划线提示）',
		removeStep2: '点击已填充单元格 — 该座位变红提示确认',
		removeStep3: '再次点击以确认移除，学生姓名回到名单',
		aisleTitle: '管理过道',
		aisleStep1: '点击网格上方的列按钮，可将该列切换为过道',
		aisleStep2: '过道内如有学生，会被自动清退并归还到名单',
		aisleStep3: '列按钮变深色表示该列已设为过道',
		bulkTitle: '批量启用/禁用座位',
		bulkDisableStep1: '在填座模式下且未选中姓名时，点击空单元格开始框选',
		bulkDisableStep2: '点击另一单元格确定矩形范围，所有空单元格高亮',
		bulkDisableStep3: '再次点击确认，将所有高亮单元格设为禁用',
		bulkEnableStep1: '点击已禁用单元格，高亮显示',
		bulkEnableStep2: '点击另一单元格确定范围',
		bulkEnableStep3: '再次点击确认，将所有高亮单元格设为启用'
	}
};

const en = {
	layout: {
		title: 'Seats',
		subtitle: 'Classroom Seat Assignment Manager'
	},
	modes: {
		fill: 'Fill',
		remove: 'Remove'
	},
	sidebar: {
		title: 'List',
		pending: 'Pending',
		browseFile: 'Browse File',
		randomFill: 'Random Fill',
		exportXlsx: 'Export XLSX'
	},
	grid: {
		aisle: 'Aisle'
	},
	states: {
		empty: 'Empty',
		filled: 'Filled',
		disabled: 'Disabled',
		aisle: 'Aisle'
	},
	usage: {
		assignTitle: 'Assigning Students',
		assignStep1: 'Click a name in the right sidebar list to select it',
		assignStep2: 'Click any empty cell in the grid to assign that student',
		assignStep3: 'The name disappears from the list after assignment',
		swapTitle: 'Swapping Two Students',
		swapStep1: 'In Fill mode, click a filled cell — it highlights as "swap selected"',
		swapStep2: 'Click another filled cell to swap the two students',
		swapStep3: 'A brief flash animation confirms the swap',
		removeTitle: 'Removing a Student',
		removeStep1: 'Switch to Remove mode (red underline indicator)',
		removeStep2: 'Click a filled cell — it turns red to confirm',
		removeStep3: 'Click again to confirm removal; the name returns to the list',
		aisleTitle: 'Managing Aisles',
		aisleStep1: 'Click column buttons above the grid to toggle a column as an aisle',
		aisleStep2: 'Students in that column are displaced back to the list',
		aisleStep3: 'The column button turns dark to indicate aisle status',
		bulkTitle: 'Bulk Enable/Disable Seats',
		bulkDisableStep1: 'In Fill mode with no name selected, click an empty cell to start',
		bulkDisableStep2: 'Click another cell to define a rectangle — all empty cells highlight',
		bulkDisableStep3: 'Click again to confirm and disable all highlighted cells',
		bulkEnableStep1: 'Click a disabled cell to start batch selection',
		bulkEnableStep2: 'Click another cell to define the batch area',
		bulkEnableStep3: 'Click again to confirm and enable all cells'
	}
};

const translations = { en, cn };

// ============================================================
// 模拟 localeStore（简化版）
// ============================================================

function createMockLocaleStore(options = {}) {
	const mockStorage = options.mockStorage || {};
	const mockNavigator = options.mockNavigator || { language: 'en-US' };
	let _locale = 'en';

	function init() {
		const stored = mockStorage['seats-locale'];
		if (stored === 'en' || stored === 'cn') {
			_locale = stored;
		} else {
			const lang = mockNavigator.language.toLowerCase();
			_locale = lang.startsWith('zh') ? 'cn' : 'en';
		}
	}

	function setLocale(newLocale) {
		_locale = newLocale;
		mockStorage['seats-locale'] = newLocale;
	}

	function t() {
		return translations[_locale];
	}

	return {
		get locale() {
			return _locale;
		},
		init,
		setLocale,
		t
	};
}

// ============================================================
// 测试框架
// ============================================================

let passed = 0;
let failed = 0;

function assert(condition, message) {
	if (!condition) {
		throw new Error(message || 'Assertion failed');
	}
}

function deepEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (typeof a !== typeof b) return false;
	if (Array.isArray(a)) {
		if (!Array.isArray(b) || a.length !== b.length) return false;
		return a.every((v, i) => deepEqual(v, b[i]));
	}
	if (typeof a === 'object') {
		const ka = Object.keys(a);
		const kb = Object.keys(b);
		if (ka.length !== kb.length) return false;
		return ka.every((k) => deepEqual(a[k], b[k]));
	}
	return false;
}

function test(name, fn) {
	try {
		fn();
		console.log(`  ✓ ${name}`);
		passed++;
	} catch (e) {
		console.log(`  ✗ ${name}`);
		console.log(`    失败: ${e.message}`);
		failed++;
	}
}

// ============================================================
// 测试套件
// ============================================================

console.log('============================================================');
console.log('测试套件: i18n 国际化');
console.log('============================================================');
console.log('');

// --- 默认语言 ---
console.log('--- 默认语言 ---');

test('默认语言为英文（无localStorage）', () => {
	const store = createMockLocaleStore({
		mockStorage: {},
		mockNavigator: { language: 'en-US' }
	});
	store.init();
	assert(store.locale === 'en', '默认语言应为en');
});

test('默认语言为中文（浏览器语言为zh）', () => {
	const store = createMockLocaleStore({
		mockStorage: {},
		mockNavigator: { language: 'zh-CN' }
	});
	store.init();
	assert(store.locale === 'cn', 'zh-CN应映射为cn');
});

test('zh-TW映射为中文', () => {
	const store = createMockLocaleStore({
		mockStorage: {},
		mockNavigator: { language: 'zh-TW' }
	});
	store.init();
	assert(store.locale === 'cn', 'zh-TW应映射为cn');
});

test('非中文语言默认为英文', () => {
	const store = createMockLocaleStore({
		mockStorage: {},
		mockNavigator: { language: 'ja-JP' }
	});
	store.init();
	assert(store.locale === 'en', 'ja-JP应默认为en');
});

test('fr-FR默认为英文', () => {
	const store = createMockLocaleStore({
		mockStorage: {},
		mockNavigator: { language: 'fr-FR' }
	});
	store.init();
	assert(store.locale === 'en', 'fr-FR应默认为en');
});

// --- 切换语言 ---
console.log('');
console.log('--- 切换语言 ---');

test('切换到中文', () => {
	const store = createMockLocaleStore({ mockStorage: {} });
	store.init();
	store.setLocale('cn');
	assert(store.locale === 'cn', '语言应切换为cn');
});

test('切换到英文', () => {
	const store = createMockLocaleStore({
		mockStorage: {},
		mockNavigator: { language: 'zh-CN' }
	});
	store.init();
	store.setLocale('en');
	assert(store.locale === 'en', '语言应切换为en');
});

test('切换后翻译文本更新', () => {
	const store = createMockLocaleStore({ mockStorage: {} });
	store.init();
	assert(store.t().modes.fill === 'Fill', '英文模式fill应为Fill');
	store.setLocale('cn');
	assert(store.t().modes.fill === '填座', '中文模式fill应为填座');
});

// --- 翻译文本正确性 ---
console.log('');
console.log('--- 翻译文本正确性 ---');

test('英文翻译：layout', () => {
	const t = translations.en;
	assert(t.layout.title === 'Seats', 'title应为Seats');
	assert(t.layout.subtitle === 'Classroom Seat Assignment Manager', 'subtitle应正确');
});

test('中文翻译：layout', () => {
	const t = translations.cn;
	assert(t.layout.title === 'Seats', 'title应为Seats');
	assert(t.layout.subtitle === '教室座位分配管理工具', 'subtitle应正确');
});

test('英文翻译：modes', () => {
	const t = translations.en;
	assert(t.modes.fill === 'Fill', 'fill应为Fill');
	assert(t.modes.remove === 'Remove', 'remove应为Remove');
});

test('中文翻译：modes', () => {
	const t = translations.cn;
	assert(t.modes.fill === '填座', 'fill应为填座');
	assert(t.modes.remove === '移除', 'remove应为移除');
});

test('英文翻译：sidebar', () => {
	const t = translations.en;
	assert(t.sidebar.title === 'List', 'title应为List');
	assert(t.sidebar.pending === 'Pending', 'pending应为Pending');
	assert(t.sidebar.browseFile === 'Browse File', 'browseFile应正确');
	assert(t.sidebar.randomFill === 'Random Fill', 'randomFill应正确');
	assert(t.sidebar.exportXlsx === 'Export XLSX', 'exportXlsx应正确');
});

test('中文翻译：sidebar', () => {
	const t = translations.cn;
	assert(t.sidebar.title === '名单', 'title应为名单');
	assert(t.sidebar.pending === '待分配', 'pending应为待分配');
	assert(t.sidebar.browseFile === '浏览文件', 'browseFile应正确');
	assert(t.sidebar.randomFill === '随机填入', 'randomFill应正确');
	assert(t.sidebar.exportXlsx === '导出 XLSX', 'exportXlsx应正确');
});

test('英文翻译：grid', () => {
	const t = translations.en;
	assert(t.grid.aisle === 'Aisle', 'aisle应为Aisle');
});

test('中文翻译：grid', () => {
	const t = translations.cn;
	assert(t.grid.aisle === '过道', 'aisle应为过道');
});

test('英文翻译：states', () => {
	const t = translations.en;
	assert(t.states.empty === 'Empty', 'empty应为Empty');
	assert(t.states.filled === 'Filled', 'filled应为Filled');
	assert(t.states.disabled === 'Disabled', 'disabled应为Disabled');
	assert(t.states.aisle === 'Aisle', 'aisle应为Aisle');
});

test('中文翻译：states', () => {
	const t = translations.cn;
	assert(t.states.empty === '空座位', 'empty应为空座位');
	assert(t.states.filled === '已填充', 'filled应为已填充');
	assert(t.states.disabled === '已禁用', 'disabled应为已禁用');
	assert(t.states.aisle === '过道', 'aisle应为过道');
});

test('英文翻译：usage 结构完整', () => {
	const t = translations.en;
	assert(t.usage.assignTitle === 'Assigning Students', 'assignTitle应正确');
	assert(t.usage.swapTitle === 'Swapping Two Students', 'swapTitle应正确');
	assert(t.usage.removeTitle === 'Removing a Student', 'removeTitle应正确');
	assert(t.usage.aisleTitle === 'Managing Aisles', 'aisleTitle应正确');
	assert(t.usage.bulkTitle === 'Bulk Enable/Disable Seats', 'bulkTitle应正确');
});

test('中文翻译：usage 结构完整', () => {
	const t = translations.cn;
	assert(t.usage.assignTitle === '分配学生', 'assignTitle应正确');
	assert(t.usage.swapTitle === '交换两个学生', 'swapTitle应正确');
	assert(t.usage.removeTitle === '移除学生', 'removeTitle应正确');
	assert(t.usage.aisleTitle === '管理过道', 'aisleTitle应正确');
	assert(t.usage.bulkTitle === '批量启用/禁用座位', 'bulkTitle应正确');
});

test('中英文翻译结构一致', () => {
	function getKeys(obj, prefix = '') {
		const keys = [];
		for (const key of Object.keys(obj)) {
			const fullKey = prefix ? `${prefix}.${key}` : key;
			if (typeof obj[key] === 'object' && obj[key] !== null) {
				keys.push(...getKeys(obj[key], fullKey));
			} else {
				keys.push(fullKey);
			}
		}
		return keys.sort();
	}
	const enKeys = getKeys(en);
	const cnKeys = getKeys(cn);
	assert(deepEqual(enKeys, cnKeys), '中英文翻译结构应一致');
});

// --- localStorage 持久化 ---
console.log('');
console.log('--- localStorage 持久化 ---');

test('setLocale保存到localStorage', () => {
	const storage = {};
	const store = createMockLocaleStore({ mockStorage: storage });
	store.init();
	store.setLocale('cn');
	assert(storage['seats-locale'] === 'cn', 'localStorage应保存seats-locale=cn');
});

test('从localStorage恢复语言设置', () => {
	const storage = { 'seats-locale': 'cn' };
	const store = createMockLocaleStore({ mockStorage: storage });
	store.init();
	assert(store.locale === 'cn', '应从localStorage恢复为cn');
});

test('localStorage优先级高于浏览器语言', () => {
	const storage = { 'seats-locale': 'en' };
	const store = createMockLocaleStore({
		mockStorage: storage,
		mockNavigator: { language: 'zh-CN' }
	});
	store.init();
	assert(store.locale === 'en', 'localStorage应优先于浏览器语言');
});

test('无效的localStorage值被忽略', () => {
	const storage = { 'seats-locale': 'invalid' };
	const store = createMockLocaleStore({ mockStorage: storage });
	store.init();
	assert(store.locale === 'en', '无效值应被忽略并使用默认');
});

test('localStorage值为en时正确恢复', () => {
	const storage = { 'seats-locale': 'en' };
	const store = createMockLocaleStore({ mockStorage: storage });
	store.init();
	assert(store.locale === 'en', '应恢复为en');
});

test('localStorage值为cn时正确恢复', () => {
	const storage = { 'seats-locale': 'cn' };
	const store = createMockLocaleStore({ mockStorage: storage });
	store.init();
	assert(store.locale === 'cn', '应恢复为cn');
});

test('多次切换语言时持久化正确', () => {
	const storage = {};
	const store = createMockLocaleStore({ mockStorage: storage });
	store.init();
	store.setLocale('cn');
	assert(storage['seats-locale'] === 'cn', '第一次切换应保存');
	store.setLocale('en');
	assert(storage['seats-locale'] === 'en', '第二次切换应更新');
	store.setLocale('cn');
	assert(storage['seats-locale'] === 'cn', '第三次切换应更新');
});

// --- 边界情况 ---
console.log('');
console.log('--- 边界情况 ---');

test('空浏览器语言默认英文', () => {
	const store = createMockLocaleStore({
		mockStorage: {},
		mockNavigator: { language: '' }
	});
	store.init();
	assert(store.locale === 'en', '空语言应默认为en');
});

test('浏览器语言大小写不敏感', () => {
	const store = createMockLocaleStore({
		mockStorage: {},
		mockNavigator: { language: 'ZH-CN' }
	});
	store.init();
	assert(store.locale === 'cn', 'ZH-CN应映射为cn');
});

test('浏览器语言包含zh但非标准格式', () => {
	const store = createMockLocaleStore({
		mockStorage: {},
		mockNavigator: { language: 'zh' }
	});
	store.init();
	assert(store.locale === 'cn', 'zh应映射为cn');
});

test('translation对象包含所有语言', () => {
	assert(translations.en !== undefined, '应包含en翻译');
	assert(translations.cn !== undefined, '应包含cn翻译');
	assert(Object.keys(translations).length === 2, '应只包含两种语言');
});

// ============================================================
// 结果汇总
// ============================================================

console.log('');
console.log('------------------------------------------------------------');
console.log(`结果: ${passed} 通过, ${failed} 失败`);
console.log('------------------------------------------------------------');

if (failed > 0) {
	process.exit(1);
}
