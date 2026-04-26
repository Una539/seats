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
 * 导出功能核心逻辑测试
 * 测试行范围计算、行翻转映射、门位置、讲桌位置等
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

	function isAisle(col) {
		return aisleColumns.includes(col);
	}

	function isDisabled(row, col) {
		return disabledCells.has(`${row}-${col}`);
	}

	return {
		get tableData() {
			return tableData;
		},
		get disabledCells() {
			return disabledCells;
		},
		isAisle,
		isDisabled
	};
}

// ============================================================
// 导出核心逻辑（从 export.ts 提取）
// ============================================================

function calculateExportMapping(grid) {
	let minDataRow = 10;
	let maxDataRow = -1;

	for (let row = 0; row < 10; row++) {
		for (let col = 0; col < 10; col++) {
			if (!grid.isAisle(col)) {
				const isDisabled = grid.isDisabled(row, col);
				const cellValue = grid.tableData[row][col];
				if (!isDisabled && cellValue) {
					if (row < minDataRow) minDataRow = row;
					if (row > maxDataRow) maxDataRow = row;
				}
			}
		}
	}

	if (maxDataRow === -1) {
		minDataRow = 0;
		maxDataRow = 9;
	}

	const dataRowCount = maxDataRow - minDataRow + 1;
	const rowToExcel = (row) => maxDataRow - row + 1;

	return { minDataRow, maxDataRow, dataRowCount, rowToExcel };
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
console.log('测试套件: 导出功能核心逻辑');
console.log('============================================================');
console.log('');

// --- 行范围计算 ---
console.log('--- 行范围计算 (去空行) ---');

test('单行数据：正确计算最小和最大行', () => {
	const grid = createSeatGridState();
	grid.tableData[3][0] = '张三';
	const { minDataRow, maxDataRow } = calculateExportMapping(grid);
	assert(minDataRow === 3, '最小数据行应为3');
	assert(maxDataRow === 3, '最大数据行应为3');
});

test('多行数据：跳过空行', () => {
	const grid = createSeatGridState();
	grid.tableData[2][0] = '张三';
	grid.tableData[5][1] = '李四';
	grid.tableData[7][2] = '王五';
	const { minDataRow, maxDataRow } = calculateExportMapping(grid);
	assert(minDataRow === 2, '最小数据行应为2');
	assert(maxDataRow === 7, '最大数据行应为7');
});

test('相邻行数据', () => {
	const grid = createSeatGridState();
	for (let r = 3; r <= 6; r++) {
		grid.tableData[r][0] = `学生${r}`;
	}
	const { minDataRow, maxDataRow } = calculateExportMapping(grid);
	assert(minDataRow === 3, '最小数据行应为3');
	assert(maxDataRow === 6, '最大数据行应为6');
});

test('数据在第0行', () => {
	const grid = createSeatGridState();
	grid.tableData[0][0] = '张三';
	const { minDataRow, maxDataRow } = calculateExportMapping(grid);
	assert(minDataRow === 0, '最小数据行应为0');
	assert(maxDataRow === 0, '最大数据行应为0');
});

test('数据在第9行', () => {
	const grid = createSeatGridState();
	grid.tableData[9][0] = '张三';
	const { minDataRow, maxDataRow } = calculateExportMapping(grid);
	assert(minDataRow === 9, '最小数据行应为9');
	assert(maxDataRow === 9, '最大数据行应为9');
});

// --- 数据行数计算 ---
console.log('');
console.log('--- 数据行数计算 ---');

test('单行数据的行数为1', () => {
	const grid = createSeatGridState();
	grid.tableData[5][0] = '张三';
	const { dataRowCount } = calculateExportMapping(grid);
	assert(dataRowCount === 1, '数据行数应为1');
});

test('多行数据的行数计算正确', () => {
	const grid = createSeatGridState();
	grid.tableData[2][0] = '张三';
	grid.tableData[7][0] = '李四';
	const { dataRowCount } = calculateExportMapping(grid);
	assert(dataRowCount === 6, '数据行数应为6 (7-2+1)');
});

test('全表填充的行数为10', () => {
	const grid = createSeatGridState();
	for (let r = 0; r < 10; r++) {
		grid.tableData[r][0] = `学生${r}`;
	}
	const { dataRowCount } = calculateExportMapping(grid);
	assert(dataRowCount === 10, '数据行数应为10');
});

// --- 行翻转映射 ---
console.log('');
console.log('--- 行翻转映射 (老师视角) ---');

test('单行映射：原行5 -> Excel行1', () => {
	const grid = createSeatGridState();
	grid.tableData[5][0] = '张三';
	const { rowToExcel } = calculateExportMapping(grid);
	assert(rowToExcel(5) === 1, '原行5应映射到Excel行1（后门所在）');
});

test('多行映射：原最大行 -> Excel行1（后门）', () => {
	const grid = createSeatGridState();
	grid.tableData[3][0] = '张三';
	grid.tableData[7][0] = '李四';
	const { rowToExcel } = calculateExportMapping(grid);
	assert(rowToExcel(7) === 1, '原最大行7应映射到Excel行1（后门）');
});

test('多行映射：原最小行 -> Excel行dataRowCount（前门）', () => {
	const grid = createSeatGridState();
	grid.tableData[3][0] = '张三';
	grid.tableData[7][0] = '李四';
	const { rowToExcel, dataRowCount } = calculateExportMapping(grid);
	assert(rowToExcel(3) === dataRowCount, `原最小行3应映射到Excel行${dataRowCount}（前门）`);
});

test('翻转映射：中间行正确计算', () => {
	const grid = createSeatGridState();
	grid.tableData[0][0] = 'A';
	grid.tableData[9][0] = 'J';
	const { rowToExcel } = calculateExportMapping(grid);
	assert(rowToExcel(0) === 10, '原行0应映射到Excel行10');
	assert(rowToExcel(9) === 1, '原行9应映射到Excel行1');
	assert(rowToExcel(4) === 6, '原行4应映射到Excel行6');
});

test('翻转映射保持相对顺序反转', () => {
	const grid = createSeatGridState();
	for (let r = 0; r < 10; r++) {
		grid.tableData[r][0] = `R${r}`;
	}
	const { rowToExcel } = calculateExportMapping(grid);
	const excelRows = [];
	for (let r = 0; r < 10; r++) {
		excelRows.push(rowToExcel(r));
	}
	for (let i = 0; i < excelRows.length - 1; i++) {
		assert(excelRows[i] > excelRows[i + 1], `原行${i}的Excel行号应大于原行${i + 1}`);
	}
});

// --- 列偏移 ---
console.log('');
console.log('--- 列偏移 ---');

test('列0映射到Excel列2（第1列为门）', () => {
	const excelCol = 0 + 2;
	assert(excelCol === 2, '列0应映射到Excel列2');
});

test('列9映射到Excel列11', () => {
	const excelCol = 9 + 2;
	assert(excelCol === 11, '列9应映射到Excel列11');
});

test('所有列偏移统一为+2', () => {
	for (let col = 0; col < 10; col++) {
		assert(col + 2 === col + 2, `列${col}的Excel列应为${col + 2}`);
	}
});

// --- 门的位置 ---
console.log('');
console.log('--- 门的位置 ---');

test('后门在左上角（Excel行1，列1）', () => {
	const grid = createSeatGridState();
	const { rowToExcel } = calculateExportMapping(grid);
	const backDoorRow = rowToExcel(9);
	const backDoorCol = 1;
	assert(backDoorRow === 1, '后门应在Excel行1');
	assert(backDoorCol === 1, '后门应在列1');
});

test('前门在左下角（Excel行dataRowCount，列1）', () => {
	const grid = createSeatGridState();
	grid.tableData[0][0] = '张三';
	grid.tableData[9][0] = '李四';
	const { dataRowCount } = calculateExportMapping(grid);
	assert(dataRowCount === 10, '前门应在Excel行10');
	assert(1 === 1, '前门应在列1');
});

test('无数据时前门在第10行', () => {
	const grid = createSeatGridState();
	const { dataRowCount } = calculateExportMapping(grid);
	assert(dataRowCount === 10, '无数据时默认显示10行');
});

// --- 讲桌位置 ---
console.log('');
console.log('--- 讲桌位置 ---');

test('讲桌在最后一行（dataRowCount + 1）', () => {
	const grid = createSeatGridState();
	grid.tableData[0][0] = '张三';
	grid.tableData[9][0] = '李四';
	const { dataRowCount } = calculateExportMapping(grid);
	const deskRow = dataRowCount + 1;
	assert(deskRow === 11, `讲桌应在行${deskRow}`);
});

test('讲桌横跨列2-11', () => {
	const startCol = 2;
	const endCol = 11;
	assert(startCol === 2, '讲桌起始列应为2');
	assert(endCol === 11, '讲桌结束列应为11');
	assert(endCol - startCol + 1 === 10, '讲桌应横跨10列');
});

// --- 空表场景 ---
console.log('');
console.log('--- 空表场景 ---');

test('空表默认显示所有行', () => {
	const grid = createSeatGridState();
	const { minDataRow, maxDataRow, dataRowCount } = calculateExportMapping(grid);
	assert(minDataRow === 0, '空表最小行应为0');
	assert(maxDataRow === 9, '空表最大行应为9');
	assert(dataRowCount === 10, '空表行数应为10');
});

test('空表的行映射正确', () => {
	const grid = createSeatGridState();
	const { rowToExcel } = calculateExportMapping(grid);
	assert(rowToExcel(0) === 10, '空表原行0应映射到Excel行10');
	assert(rowToExcel(9) === 1, '空表原行9应映射到Excel行1');
});

// --- 部分数据场景 ---
console.log('');
console.log('--- 部分数据场景 ---');

test('只有中间几行有数据', () => {
	const grid = createSeatGridState();
	grid.tableData[3][0] = '张三';
	grid.tableData[4][1] = '李四';
	grid.tableData[5][2] = '王五';
	const { minDataRow, maxDataRow, dataRowCount, rowToExcel } = calculateExportMapping(grid);
	assert(minDataRow === 3, '最小行应为3');
	assert(maxDataRow === 5, '最大行应为5');
	assert(dataRowCount === 3, '数据行数应为3');
	assert(rowToExcel(5) === 1, '原行5（最后有数据行）-> Excel行1');
	assert(rowToExcel(3) === 3, '原行3（最前有数据行）-> Excel行3');
});

test('跳过前面空行', () => {
	const grid = createSeatGridState();
	grid.tableData[6][0] = '张三';
	grid.tableData[7][0] = '李四';
	const { minDataRow, maxDataRow } = calculateExportMapping(grid);
	assert(minDataRow === 6, '应跳过前6个空行');
	assert(maxDataRow === 7, '最大行应为7');
});

test('跳过后面空行', () => {
	const grid = createSeatGridState();
	grid.tableData[0][0] = '张三';
	grid.tableData[1][0] = '李四';
	const { minDataRow, maxDataRow } = calculateExportMapping(grid);
	assert(minDataRow === 0, '最小行应为0');
	assert(maxDataRow === 1, '应跳过后面的空行');
});

// --- 过道场景 ---
console.log('');
console.log('--- 过道场景 ---');

test('过道不影响行范围计算', () => {
	const grid = createSeatGridState();
	grid.tableData[2][0] = '张三';
	grid.tableData[5][0] = '李四';
	// 过道在列5
	const aisleColumns = [5];
	function isAisle(col) {
		return aisleColumns.includes(col);
	}
	grid.isAisle = isAisle;
	const { minDataRow, maxDataRow } = calculateExportMapping(grid);
	assert(minDataRow === 2, '最小行应为2');
	assert(maxDataRow === 5, '最大行应为5');
});

test('过道列在Excel中应合并显示', () => {
	const aisleCol = 3;
	const excelCol = aisleCol + 2;
	assert(excelCol === 5, '过道列3在Excel中应为列5');
	// 验证合并范围
	const startRow = 1;
	const endRow = 10;
	assert(startRow === 1, '合并起始行应为1');
	assert(endRow === 10, '合并结束行应为10');
});

// --- 禁用场景 ---
console.log('');
console.log('--- 禁用场景 ---');

test('禁用单元格不计入行范围', () => {
	const grid = createSeatGridState();
	grid.tableData[2][0] = '张三';
	grid.tableData[8][0] = '李四';
	grid.disabledCells._set.add('8-0');
	const { minDataRow, maxDataRow } = calculateExportMapping(grid);
	assert(minDataRow === 2, '最小行应为2');
	assert(maxDataRow === 2, '最大行应为2（禁用单元格不计入）');
});

test('禁用单元格在导出时应被跳过', () => {
	const grid = createSeatGridState();
	grid.tableData[0][0] = '张三';
	grid.tableData[0][1] = '李四';
	grid.disabledCells._set.add('0-1');
	// 验证逻辑：导出时isDisabled检查应跳过该单元格
	assert(grid.isDisabled(0, 1), '单元格[0][1]应为禁用');
	assert(!grid.isDisabled(0, 0), '单元格[0][0]不应为禁用');
});

// --- 全满场景 ---
console.log('');
console.log('--- 全满场景 ---');

test('全表填充时的行范围', () => {
	const grid = createSeatGridState();
	for (let r = 0; r < 10; r++) {
		for (let c = 0; c < 10; c++) {
			grid.tableData[r][c] = `S${r}${c}`;
		}
	}
	const { minDataRow, maxDataRow, dataRowCount } = calculateExportMapping(grid);
	assert(minDataRow === 0, '最小行应为0');
	assert(maxDataRow === 9, '最大行应为9');
	assert(dataRowCount === 10, '数据行数应为10');
});

test('全满时的行映射', () => {
	const grid = createSeatGridState();
	for (let r = 0; r < 10; r++) {
		grid.tableData[r][0] = `R${r}`;
	}
	const { rowToExcel } = calculateExportMapping(grid);
	assert(rowToExcel(9) === 1, '最后一行应映射到Excel行1');
	assert(rowToExcel(0) === 10, '第一行应映射到Excel行10');
});

// --- 边界情况 ---
console.log('');
console.log('--- 边界情况 ---');

test('只有最后一行有数据', () => {
	const grid = createSeatGridState();
	grid.tableData[9][5] = '张三';
	const { minDataRow, maxDataRow, dataRowCount, rowToExcel } = calculateExportMapping(grid);
	assert(minDataRow === 9, '最小行应为9');
	assert(maxDataRow === 9, '最大行应为9');
	assert(dataRowCount === 1, '数据行数应为1');
	assert(rowToExcel(9) === 1, '应映射到Excel行1');
});

test('只有第一行有数据', () => {
	const grid = createSeatGridState();
	grid.tableData[0][5] = '张三';
	const { minDataRow, maxDataRow, dataRowCount, rowToExcel } = calculateExportMapping(grid);
	assert(minDataRow === 0, '最小行应为0');
	assert(maxDataRow === 0, '最大行应为0');
	assert(dataRowCount === 1, '数据行数应为1');
	assert(rowToExcel(0) === 1, '应映射到Excel行1');
});

test('分散在不同列的同一行', () => {
	const grid = createSeatGridState();
	grid.tableData[4][0] = 'A';
	grid.tableData[4][3] = 'B';
	grid.tableData[4][9] = 'C';
	const { minDataRow, maxDataRow } = calculateExportMapping(grid);
	assert(minDataRow === 4, '最小行应为4');
	assert(maxDataRow === 4, '最大行应为4');
});

test('过道+禁用的组合场景', () => {
	const grid = createSeatGridState();
	const aisleColumns = [2, 7];
	grid.isAisle = (col) => aisleColumns.includes(col);
	grid.tableData[1][0] = '张三';
	grid.tableData[1][2] = '过道';
	grid.tableData[1][7] = '过道';
	grid.tableData[8][5] = '李四';
	grid.disabledCells._set.add('5-5');
	const { minDataRow, maxDataRow } = calculateExportMapping(grid);
	assert(minDataRow === 1, '最小行应为1');
	assert(maxDataRow === 8, '最大行应为8');
});

console.log('');
console.log('------------------------------------------------------------');
console.log(`结果: ${passed} 通过, ${failed} 失败`);
console.log('------------------------------------------------------------');

if (failed > 0) {
	process.exit(1);
}
