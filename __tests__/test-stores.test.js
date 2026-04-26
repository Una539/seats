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
 * SeatGridState 状态管理测试
 * 测试所有座位网格状态管理功能
 */

// ============================================================
// 模拟 Svelte 响应式系统
// ============================================================

class MockSvelteSet {
	constructor() {
		this._set = new Set();
	}
	has(key) {
		return this._set.has(key);
	}
	add(key) {
		this._set.add(key);
		return this;
	}
	delete(key) {
		return this._set.delete(key);
	}
	clear() {
		this._set.clear();
	}
	get size() {
		return this._set.size;
	}
	[Symbol.iterator]() {
		return this._set[Symbol.iterator]();
	}
}

function createSeatGridState() {
	const tableData = Array.from({ length: 10 }, () => Array(10).fill(''));
	let aisleColumns = [];
	const disabledCells = new MockSvelteSet();
	const pendingDisable = new MockSvelteSet();
	const pendingEnable = new MockSvelteSet();
	const pendingClear = new MockSvelteSet();
	let swapFirst = null;
	let batchStart = null;
	let batchEnd = null;

	function resetBatch() {
		pendingDisable.clear();
		pendingEnable.clear();
		batchStart = null;
		batchEnd = null;
	}

	function isAisle(col) {
		return aisleColumns.includes(col);
	}

	function isDisabled(row, col) {
		return disabledCells.has(`${row}-${col}`);
	}

	function toggleAisle(col) {
		const displaced = [];
		if (isAisle(col)) {
			aisleColumns = aisleColumns.filter((c) => c !== col);
			for (let row = 0; row < 10; row++) {
				tableData[row][col] = '';
				disabledCells.delete(`${row}-${col}`);
			}
		} else {
			for (let row = 0; row < 10; row++) {
				const name = tableData[row][col];
				if (name) {
					displaced.push(name);
					tableData[row][col] = '';
				}
				disabledCells.delete(`${row}-${col}`);
			}
			aisleColumns = [...aisleColumns, col];
		}
		return displaced;
	}

	function fillCell(row, col, selectedLine, onNameReturn, onNameFilled) {
		const key = `${row}-${col}`;
		const _isAisle = isAisle(col);
		const _isDisabled = isDisabled(row, col);
		const current = tableData[row][col];

		if (selectedLine && (_isAisle || _isDisabled)) {
			return;
		}

		if (_isAisle) {
			if (pendingEnable.has(key)) {
				toggleAisle(col);
				pendingEnable.clear();
			} else {
				resetBatch();
				pendingEnable.add(key);
			}
		} else if (_isDisabled) {
			const isConfirm =
				pendingEnable.has(key) || (batchEnd && batchEnd.row === row && batchEnd.col === col);
			if (isConfirm && pendingEnable.size > 0) {
				for (const k of pendingEnable) disabledCells.delete(k);
				pendingEnable.clear();
				batchStart = null;
				batchEnd = null;
			} else if (batchStart) {
				const minRow = Math.min(batchStart.row, row);
				const maxRow = Math.max(batchStart.row, row);
				const minCol = Math.min(batchStart.col, col);
				const maxCol = Math.max(batchStart.col, col);
				pendingEnable.clear();
				for (let r = minRow; r <= maxRow; r++) {
					for (let c = minCol; c <= maxCol; c++) {
						const k = `${r}-${c}`;
						if (disabledCells.has(k)) pendingEnable.add(k);
					}
				}
				batchStart = null;
				batchEnd = { row, col };
			} else {
				resetBatch();
				batchStart = { row, col };
				pendingEnable.add(key);
			}
		} else if (current) {
			if (pendingClear.has(key)) {
				tableData[row][col] = '';
				onNameReturn(current);
				pendingClear.delete(key);
			} else {
				pendingClear.clear();
				pendingClear.add(key);
			}
		} else if (selectedLine) {
			tableData[row][col] = selectedLine;
			if (onNameFilled) onNameFilled(selectedLine);
			resetBatch();
		} else {
			const isConfirm =
				pendingDisable.has(key) || (batchEnd && batchEnd.row === row && batchEnd.col === col);
			if (isConfirm && pendingDisable.size > 0) {
				for (const k of pendingDisable) disabledCells.add(k);
				pendingDisable.clear();
				batchStart = null;
				batchEnd = null;
			} else if (batchStart) {
				const minRow = Math.min(batchStart.row, row);
				const maxRow = Math.max(batchStart.row, row);
				const minCol = Math.min(batchStart.col, col);
				const maxCol = Math.max(batchStart.col, col);
				pendingDisable.clear();
				for (let r = minRow; r <= maxRow; r++) {
					for (let c = minCol; c <= maxCol; c++) {
						const k = `${r}-${c}`;
						if (!disabledCells.has(k) && !isAisle(c) && !tableData[r][c]) {
							pendingDisable.add(k);
						}
					}
				}
				batchStart = null;
				batchEnd = { row, col };
			} else {
				resetBatch();
				batchStart = { row, col };
				pendingDisable.add(key);
			}
		}
	}

	function getAvailableCells() {
		const available = [];
		for (let r = 0; r < tableData.length; r++) {
			for (let c = 0; c < tableData[r].length; c++) {
				if (isAisle(c)) continue;
				if (isDisabled(r, c)) continue;
				if (tableData[r][c]) continue;
				available.push({ row: r, col: c });
			}
		}
		return available;
	}

	function randomFill(lines, onLinesUpdate) {
		const available = getAvailableCells();
		if (lines.length > available.length) {
			return false;
		}
		for (let i = available.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[available[i], available[j]] = [available[j], available[i]];
		}
		const namesToFill = [...lines];
		for (let i = namesToFill.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[namesToFill[i], namesToFill[j]] = [namesToFill[j], namesToFill[i]];
		}
		for (let i = 0; i < namesToFill.length; i++) {
			const { row, col } = available[i];
			tableData[row][col] = namesToFill[i];
		}
		onLinesUpdate([]);
		resetBatch();
		return true;
	}

	function clearCell(row, col, onNameReturn) {
		const name = tableData[row][col];
		if (name) {
			tableData[row][col] = '';
			onNameReturn(name);
		}
	}

	function swapCells(row1, col1, row2, col2) {
		const name1 = tableData[row1][col1];
		const name2 = tableData[row2][col2];
		if (!name1 || !name2) return false;
		tableData[row1][col1] = name2;
		tableData[row2][col2] = name1;
		swapFirst = null;
		return true;
	}

	return {
		get tableData() {
			return tableData;
		},
		get aisleColumns() {
			return aisleColumns;
		},
		get disabledCells() {
			return disabledCells;
		},
		get pendingDisable() {
			return pendingDisable;
		},
		get pendingEnable() {
			return pendingEnable;
		},
		get pendingClear() {
			return pendingClear;
		},
		get swapFirst() {
			return swapFirst;
		},
		set batchStart(v) {
			batchStart = v;
		},
		set batchEnd(v) {
			batchEnd = v;
		},
		get batchStart() {
			return batchStart;
		},
		get batchEnd() {
			return batchEnd;
		},
		resetBatch,
		isAisle,
		isDisabled,
		toggleAisle,
		fillCell,
		getAvailableCells,
		randomFill,
		clearCell,
		swapCells
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
console.log('测试套件: SeatGridState 状态管理');
console.log('============================================================');
console.log('');

// --- 初始化测试 ---
console.log('--- 初始化 ---');

test('初始化10x10空表格', () => {
	const grid = createSeatGridState();
	assert(grid.tableData.length === 10, '行数应为10');
	for (let i = 0; i < 10; i++) {
		assert(grid.tableData[i].length === 10, `第${i}行列数应为10`);
		for (let j = 0; j < 10; j++) {
			assert(grid.tableData[i][j] === '', `单元格[${i}][${j}]应为空`);
		}
	}
});

test('初始化时过道列为空', () => {
	const grid = createSeatGridState();
	assert(grid.aisleColumns.length === 0, '过道列应为空数组');
});

test('初始化时禁用单元格为空', () => {
	const grid = createSeatGridState();
	assert(grid.disabledCells.size === 0, '禁用单元格应为空');
});

test('初始化时批量操作状态为空', () => {
	const grid = createSeatGridState();
	assert(grid.batchStart === null, 'batchStart应为null');
	assert(grid.batchEnd === null, 'batchEnd应为null');
	assert(grid.pendingDisable.size === 0, 'pendingDisable应为空');
	assert(grid.pendingEnable.size === 0, 'pendingEnable应为空');
	assert(grid.pendingClear.size === 0, 'pendingClear应为空');
});

// --- 过道切换测试 ---
console.log('');
console.log('--- 过道切换 ---');

test('设置过道列', () => {
	const grid = createSeatGridState();
	grid.toggleAisle(3);
	assert(grid.isAisle(3), '列3应为过道');
	assert(grid.aisleColumns.includes(3), '过道列数组应包含3');
});

test('设置过道时清空该列数据并返回清退姓名', () => {
	const grid = createSeatGridState();
	grid.tableData[0][3] = '张三';
	grid.tableData[1][3] = '李四';
	grid.tableData[2][3] = '';
	const displaced = grid.toggleAisle(3);
	assert(deepEqual(displaced.sort(), ['张三', '李四'].sort()), '应返回被清退的姓名');
	assert(grid.tableData[0][3] === '', '单元格应被清空');
	assert(grid.tableData[1][3] === '', '单元格应被清空');
	assert(grid.isAisle(3), '列3应为过道');
});

test('取消过道列', () => {
	const grid = createSeatGridState();
	grid.toggleAisle(3);
	assert(grid.isAisle(3), '列3应为过道');
	grid.toggleAisle(3);
	assert(!grid.isAisle(3), '列3不应再是过道');
	assert(!grid.aisleColumns.includes(3), '过道列数组不应包含3');
});

test('取消过道时返回空数组', () => {
	const grid = createSeatGridState();
	grid.toggleAisle(3);
	const displaced = grid.toggleAisle(3);
	assert(deepEqual(displaced, []), '取消过道应返回空数组');
});

test('设置过道时清除该列的禁用状态', () => {
	const grid = createSeatGridState();
	grid.toggleAisle(3);
	grid.disabledCells.add('2-3');
	grid.toggleAisle(3); // 取消
	grid.toggleAisle(3); // 重新设置
	assert(!grid.isDisabled(2, 3), '禁用状态应被清除');
});

test('可以设置多个过道列', () => {
	const grid = createSeatGridState();
	grid.toggleAisle(2);
	grid.toggleAisle(5);
	grid.toggleAisle(8);
	assert(grid.isAisle(2), '列2应为过道');
	assert(grid.isAisle(5), '列5应为过道');
	assert(grid.isAisle(8), '列8应为过道');
	assert(grid.aisleColumns.length === 3, '应有3个过道列');
});

// --- 单元格填充测试 ---
console.log('');
console.log('--- 单元格填充 ---');

test('向空单元格填入姓名', () => {
	const grid = createSeatGridState();
	let filledName = null;
	grid.fillCell(
		0,
		0,
		'张三',
		() => {},
		(name) => {
			filledName = name;
		}
	);
	assert(grid.tableData[0][0] === '张三', '单元格应填入张三');
	assert(filledName === '张三', '应触发onNameFilled回调');
});

test('在过道单元格上填入姓名被阻止', () => {
	const grid = createSeatGridState();
	grid.toggleAisle(2);
	let filledName = null;
	grid.fillCell(
		0,
		2,
		'张三',
		() => {},
		(name) => {
			filledName = name;
		}
	);
	assert(grid.tableData[0][2] === '', '过道单元格不应被填入');
	assert(filledName === null, '不应触发onNameFilled回调');
});

test('在禁用单元格上填入姓名被阻止', () => {
	const grid = createSeatGridState();
	grid.disabledCells.add('3-4');
	let filledName = null;
	grid.fillCell(
		3,
		4,
		'张三',
		() => {},
		(name) => {
			filledName = name;
		}
	);
	assert(grid.tableData[3][4] === '', '禁用单元格不应被填入');
	assert(filledName === null, '不应触发onNameFilled回调');
});

// --- 批量禁用测试 ---
console.log('');
console.log('--- 批量禁用 ---');

test('第一次点击空单元格开始批量禁用', () => {
	const grid = createSeatGridState();
	grid.fillCell(0, 0, '', () => {});
	assert(grid.batchStart !== null, 'batchStart应被设置');
	assert(grid.batchStart.row === 0, 'batchStart行应为0');
	assert(grid.batchStart.col === 0, 'batchStart列应为0');
	assert(grid.pendingDisable.has('0-0'), '单元格应加入待禁用列表');
});

test('第二次点击确认批量禁用', () => {
	const grid = createSeatGridState();
	grid.fillCell(0, 0, '', () => {});
	grid.fillCell(1, 1, '', () => {});
	grid.fillCell(1, 1, '', () => {});
	assert(grid.disabledCells.has('0-0'), '单元格[0][0]应被禁用');
	assert(grid.pendingDisable.size === 0, '待禁用列表应被清空');
	assert(grid.batchStart === null, 'batchStart应被重置');
});

test('批量禁用矩形区域', () => {
	const grid = createSeatGridState();
	grid.fillCell(0, 0, '', () => {});
	grid.fillCell(2, 2, '', () => {});
	grid.fillCell(2, 2, '', () => {});
	assert(grid.disabledCells.has('0-0'), '应包含起始点');
	assert(grid.disabledCells.has('0-1'), '应包含矩形区域内单元格');
	assert(grid.disabledCells.has('0-2'), '应包含矩形区域内单元格');
	assert(grid.disabledCells.has('1-0'), '应包含矩形区域内单元格');
	assert(grid.disabledCells.has('2-2'), '应包含终点');
});

test('批量禁用跳过过道列', () => {
	const grid = createSeatGridState();
	grid.toggleAisle(1);
	grid.fillCell(0, 0, '', () => {});
	grid.fillCell(1, 2, '', () => {});
	grid.fillCell(1, 2, '', () => {});
	assert(!grid.disabledCells.has('0-1'), '过道列不应被禁用');
	assert(!grid.disabledCells.has('1-1'), '过道列不应被禁用');
});

test('批量禁用跳过已填姓名单元格', () => {
	const grid = createSeatGridState();
	grid.tableData[1][1] = '张三';
	grid.fillCell(0, 0, '', () => {});
	grid.fillCell(2, 2, '', () => {});
	grid.fillCell(2, 2, '', () => {});
	assert(!grid.disabledCells.has('1-1'), '已填姓名的单元格不应被禁用');
});

// --- 批量启用测试 ---
console.log('');
console.log('--- 批量启用 ---');

test('第一次点击禁用单元格开始批量启用', () => {
	const grid = createSeatGridState();
	grid.disabledCells.add('2-3');
	grid.fillCell(2, 3, '', () => {});
	assert(grid.batchStart !== null, 'batchStart应被设置');
	assert(grid.pendingEnable.has('2-3'), '单元格应加入待启用列表');
});

test('第二次点击确认批量启用', () => {
	const grid = createSeatGridState();
	grid.disabledCells.add('2-3');
	grid.fillCell(2, 3, '', () => {});
	grid.fillCell(2, 3, '', () => {});
	assert(!grid.disabledCells.has('2-3'), '单元格应被恢复启用');
	assert(grid.pendingEnable.size === 0, '待启用列表应被清空');
});

test('批量启用矩形区域内的禁用单元格', () => {
	const grid = createSeatGridState();
	grid.disabledCells.add('0-0');
	grid.disabledCells.add('0-1');
	grid.disabledCells.add('1-0');
	grid.disabledCells.add('1-1');
	grid.fillCell(0, 0, '', () => {});
	grid.fillCell(1, 1, '', () => {});
	grid.fillCell(1, 1, '', () => {});
	assert(!grid.disabledCells.has('0-0'), '应被启用');
	assert(!grid.disabledCells.has('0-1'), '应被启用');
	assert(!grid.disabledCells.has('1-0'), '应被启用');
	assert(!grid.disabledCells.has('1-1'), '应被启用');
});

// --- 清除单元格测试 ---
console.log('');
console.log('--- 清除单元格 (fillCell 移除模式) ---');

test('第一次点击已填姓名单元格加入待清除', () => {
	const grid = createSeatGridState();
	grid.tableData[3][4] = '张三';
	grid.fillCell(3, 4, '', () => {});
	assert(grid.pendingClear.has('3-4'), '单元格应加入待清除列表');
	assert(grid.tableData[3][4] === '张三', '姓名应未被移除');
});

test('第二次点击确认清除姓名', () => {
	const grid = createSeatGridState();
	grid.tableData[3][4] = '张三';
	let returnedName = null;
	grid.fillCell(3, 4, '', (name) => {
		returnedName = name;
	});
	grid.fillCell(3, 4, '', (name) => {
		returnedName = name;
	});
	assert(grid.tableData[3][4] === '', '姓名应被移除');
	assert(returnedName === '张三', '应触发onNameReturn回调');
	assert(!grid.pendingClear.has('3-4'), '待清除列表应被清除');
});

// --- 交换单元格测试 ---
console.log('');
console.log('--- 交换单元格 ---');

test('交换两个有姓名的单元格', () => {
	const grid = createSeatGridState();
	grid.tableData[0][0] = '张三';
	grid.tableData[1][1] = '李四';
	const result = grid.swapCells(0, 0, 1, 1);
	assert(result === true, '交换应成功');
	assert(grid.tableData[0][0] === '李四', '张三位置应变为李四');
	assert(grid.tableData[1][1] === '张三', '李四位置应变为张三');
});

test('交换包含空单元格时失败', () => {
	const grid = createSeatGridState();
	grid.tableData[0][0] = '张三';
	grid.tableData[1][1] = '';
	const result = grid.swapCells(0, 0, 1, 1);
	assert(result === false, '交换应失败');
	assert(grid.tableData[0][0] === '张三', '张三位置不应变');
	assert(grid.tableData[1][1] === '', '空单元格应保持空');
});

test('交换两个空单元格时失败', () => {
	const grid = createSeatGridState();
	const result = grid.swapCells(0, 0, 1, 1);
	assert(result === false, '交换应失败');
});

// --- 随机填入测试 ---
console.log('');
console.log('--- 随机填入 ---');

test('随机填入所有姓名', () => {
	const grid = createSeatGridState();
	const names = ['张三', '李四', '王五', '赵六', '钱七'];
	let linesUpdated = null;
	const result = grid.randomFill(names, (lines) => {
		linesUpdated = lines;
	});
	assert(result === true, '随机填入应成功');
	assert(deepEqual(linesUpdated, []), '名单应被清空');

	let filledNames = [];
	for (let r = 0; r < 10; r++) {
		for (let c = 0; c < 10; c++) {
			if (grid.tableData[r][c]) filledNames.push(grid.tableData[r][c]);
		}
	}
	assert(filledNames.length === 5, '应填入5个姓名');
	for (const name of names) {
		assert(filledNames.includes(name), `姓名${name}应被填入`);
	}
});

test('随机填入无重复', () => {
	const grid = createSeatGridState();
	const names = ['张三', '李四', '王五'];
	grid.randomFill(names, () => {});

	const filledNames = [];
	for (let r = 0; r < 10; r++) {
		for (let c = 0; c < 10; c++) {
			if (grid.tableData[r][c]) filledNames.push(grid.tableData[r][c]);
		}
	}
	const uniqueNames = new Set(filledNames);
	assert(uniqueNames.size === filledNames.length, '不应有重复姓名');
});

test('随机填入在有过道时避开过道列', () => {
	const grid = createSeatGridState();
	grid.toggleAisle(4);
	grid.toggleAisle(6);
	const names = ['张三', '李四', '王五'];
	grid.randomFill(names, () => {});

	for (let r = 0; r < 10; r++) {
		assert(grid.tableData[r][4] === '', '过道列4应为空');
		assert(grid.tableData[r][6] === '', '过道列6应为空');
	}
});

test('随机填入在禁用单元格时避开', () => {
	const grid = createSeatGridState();
	grid.disabledCells.add('0-0');
	grid.disabledCells.add('1-1');
	const names = ['张三', '李四'];
	grid.randomFill(names, () => {});
	assert(grid.tableData[0][0] === '', '禁用单元格不应被填入');
	assert(grid.tableData[1][1] === '', '禁用单元格不应被填入');
});

test('人数超过可用单元格时随机填入失败', () => {
	const grid = createSeatGridState();
	const names = Array.from({ length: 101 }, (_, i) => `学生${i}`);
	const result = grid.randomFill(names, () => {});
	assert(result === false, '随机填入应失败');
});

test('刚好填满所有可用单元格', () => {
	const grid = createSeatGridState();
	grid.toggleAisle(5);
	const available = grid.getAvailableCells();
	const names = available.map((_, i) => `学生${i}`);
	const result = grid.randomFill(names, () => {});
	assert(result === true, '随机填入应成功');
	let filledCount = 0;
	for (let r = 0; r < 10; r++) {
		for (let c = 0; c < 10; c++) {
			if (grid.tableData[r][c]) filledCount++;
		}
	}
	assert(filledCount === names.length, '所有姓名应被填入');
});

// --- 获取可用单元格测试 ---
console.log('');
console.log('--- 获取可用单元格 ---');

test('空表格返回100个可用单元格', () => {
	const grid = createSeatGridState();
	const available = grid.getAvailableCells();
	assert(available.length === 100, `应有100个可用单元格，实际${available.length}`);
});

test('可用单元格排除过道列', () => {
	const grid = createSeatGridState();
	grid.toggleAisle(3);
	const available = grid.getAvailableCells();
	for (const cell of available) {
		assert(cell.col !== 3, '可用单元格不应在过道列');
	}
	assert(available.length === 90, '应有90个可用单元格');
});

test('可用单元格排除禁用单元格', () => {
	const grid = createSeatGridState();
	grid.disabledCells.add('0-0');
	grid.disabledCells.add('5-5');
	const available = grid.getAvailableCells();
	for (const cell of available) {
		assert(!(cell.row === 0 && cell.col === 0), '不应包含禁用单元格[0][0]');
		assert(!(cell.row === 5 && cell.col === 5), '不应包含禁用单元格[5][5]');
	}
	assert(available.length === 98, '应有98个可用单元格');
});

test('可用单元格排除已填姓名', () => {
	const grid = createSeatGridState();
	grid.tableData[0][0] = '张三';
	grid.tableData[9][9] = '李四';
	const available = grid.getAvailableCells();
	for (const cell of available) {
		assert(grid.tableData[cell.row][cell.col] === '', '可用单元格应为空');
	}
	assert(available.length === 98, '应有98个可用单元格');
});

test('复杂场景：过道+禁用+已填', () => {
	const grid = createSeatGridState();
	grid.toggleAisle(2);
	grid.toggleAisle(7);
	grid.disabledCells.add('0-0');
	grid.disabledCells.add('1-1');
	grid.tableData[3][3] = '张三';
	const available = grid.getAvailableCells();
	assert(available.length === 100 - 20 - 2 - 1, '可用单元格数量应正确');
	for (const cell of available) {
		assert(!grid.isAisle(cell.col), '不应在过道列');
		assert(!grid.isDisabled(cell.row, cell.col), '不应是禁用单元格');
		assert(grid.tableData[cell.row][cell.col] === '', '应为空单元格');
	}
});

// --- resetBatch 测试 ---
console.log('');
console.log('--- resetBatch ---');

test('resetBatch清除所有批量操作状态', () => {
	const grid = createSeatGridState();
	grid.pendingDisable.add('0-0');
	grid.pendingEnable.add('1-1');
	grid.batchStart = { row: 0, col: 0 };
	grid.batchEnd = { row: 1, col: 1 };
	grid.resetBatch();
	assert(grid.pendingDisable.size === 0, 'pendingDisable应被清空');
	assert(grid.pendingEnable.size === 0, 'pendingEnable应被清空');
	assert(grid.batchStart === null, 'batchStart应被重置');
	assert(grid.batchEnd === null, 'batchEnd应被重置');
});

test('填入姓名后自动resetBatch', () => {
	const grid = createSeatGridState();
	grid.fillCell(0, 0, '', () => {});
	assert(grid.batchStart !== null, 'batchStart应被设置');
	grid.fillCell(0, 1, '张三', () => {});
	assert(grid.batchStart === null, 'batchStart应被重置');
});

// --- clearCell 程序化清除测试 ---
console.log('');
console.log('--- clearCell (程序化) ---');

test('clearCell清除有姓名的单元格', () => {
	const grid = createSeatGridState();
	grid.tableData[2][3] = '王五';
	let returned = null;
	grid.clearCell(2, 3, (name) => {
		returned = name;
	});
	assert(grid.tableData[2][3] === '', '单元格应被清空');
	assert(returned === '王五', '应返回被清除的姓名');
});

test('clearCell对空单元格无效果', () => {
	const grid = createSeatGridState();
	let returned = 'not called';
	grid.clearCell(5, 5, (name) => {
		returned = name;
	});
	assert(grid.tableData[5][5] === '', '单元格应保持空');
	assert(returned === 'not called', '不应触发回调');
});

console.log('');
console.log('------------------------------------------------------------');
console.log(`结果: ${passed} 通过, ${failed} 失败`);
console.log('------------------------------------------------------------');

if (failed > 0) {
	process.exit(1);
}
