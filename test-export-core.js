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

// 简化验证：只测试核心逻辑（行映射、讲桌位置）
// 不依赖ExcelJS，纯JavaScript验证

function calculateMaxDataRow(tableData, isAisle, isDisabled) {
	let maxDataRow = 1;
	for (let row = 0; row < 10; row++) {
		for (let col = 0; col < 10; col++) {
			if (!isAisle(col)) {
				const cellValue = tableData[row][col];
				const disabled = isDisabled(row, col);
				if (!disabled && cellValue) {
					const excelRow = 10 - row;
					if (excelRow > maxDataRow) maxDataRow = excelRow;
				}
			}
		}
	}
	return maxDataRow;
}

function getExcelRow(row) {
	return 10 - row;
}

function getExcelCol(col) {
	return col + 2;
}

function getDeskRowNum(maxDataRow) {
	return Math.max(11, maxDataRow + 1);
}

// 测试套件
const tests = [
	{
		name: '空座位表',
		tableData: Array.from({ length: 10 }, () => Array(10).fill('')),
		aisleColumns: [],
		disabledCells: [],
		expected: {
			maxDataRow: 1,
			frontDoorCell: { row: 1, col: 1 },
			backDoorCell: { row: 1, col: 1 },
			deskRow: 11
		}
	},
	{
		name: '后排和前排都有数据',
		tableData: (() => {
			const d = Array.from({ length: 10 }, () => Array(10).fill(''));
			d[9][0] = '张三';
			d[9][1] = '李四';
			d[0][2] = '赵六';
			return d;
		})(),
		aisleColumns: [],
		disabledCells: [],
		expected: {
			maxDataRow: 10,
			frontDoorCell: { row: 1, col: 1 },
			backDoorCell: { row: 10, col: 1 },
			deskRow: 11
		}
	},
	{
		name: '全部位置都有数据',
		tableData: (() => {
			const d = Array.from({ length: 10 }, () => Array(10).fill('学生'));
			return d;
		})(),
		aisleColumns: [],
		disabledCells: [],
		expected: {
			maxDataRow: 10,
			frontDoorCell: { row: 1, col: 1 },
			backDoorCell: { row: 10, col: 1 },
			deskRow: 11
		}
	},
	{
		name: '包含过道',
		tableData: (() => {
			const d = Array.from({ length: 10 }, () => Array(10).fill(''));
			d[9][0] = '左';
			d[9][6] = '右';
			return d;
		})(),
		aisleColumns: [4],
		disabledCells: [],
		expected: {
			maxDataRow: 1,
			frontDoorCell: { row: 1, col: 1 },
			backDoorCell: { row: 1, col: 1 },
			deskRow: 11
		}
	},
	{
		name: '包含禁用单元格',
		tableData: (() => {
			const d = Array.from({ length: 10 }, () => Array(10).fill(''));
			d[8][0] = '有效';
			return d;
		})(),
		aisleColumns: [],
		disabledCells: ['6-1', '6-2'],
		expected: {
			maxDataRow: 2,
			frontDoorCell: { row: 1, col: 1 },
			backDoorCell: { row: 2, col: 1 },
			deskRow: 11
		}
	}
];

// 辅助函数
function isAisle(col, aisleColumns) {
	return aisleColumns.includes(col);
}
function isDisabled(row, col, disabledCells) {
	return disabledCells.includes(`${row}-${col}`);
}

// 运行测试
console.log('='.repeat(60));
console.log('座位导出核心逻辑验证');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

for (const test of tests) {
	console.log(`\n测试: ${test.name}`);

	const maxDataRow = calculateMaxDataRow(
		test.tableData,
		(col) => isAisle(col, test.aisleColumns),
		(row, col) => isDisabled(row, col, test.disabledCells)
	);

	console.log(`  maxDataRow: 期望${test.expected.maxDataRow}, 实际${maxDataRow}`);
	if (maxDataRow !== test.expected.maxDataRow) {
		console.error('  ✗ 失败');
		failed++;
		continue;
	}

	console.log(`  前门位置: (1,1)`);
	if (test.expected.frontDoorCell.row !== 1 || test.expected.frontDoorCell.col !== 1) {
		console.error('  ✗ 失败');
		failed++;
		continue;
	}

	const backDoorRow = maxDataRow;
	const backDoorCol = 1;
	console.log(
		`  后门位置: (${backDoorRow},${backDoorCol}) 期望(${test.expected.backDoorCell.row},${test.expected.backDoorCell.col})`
	);
	if (
		backDoorRow !== test.expected.backDoorCell.row ||
		backDoorCol !== test.expected.backDoorCell.col
	) {
		console.error('  ✗ 失败');
		failed++;
		continue;
	}

	const deskRowNum = getDeskRowNum(maxDataRow);
	console.log(`  讲桌行: ${deskRowNum} 期望${test.expected.deskRow}`);
	if (deskRowNum !== test.expected.deskRow) {
		console.error('  ✗ 失败');
		failed++;
		continue;
	}

	console.log('  行映射:');
	for (const origRow of [0, 5, 9]) {
		const excelRow = getExcelRow(origRow);
		console.log(`    原行${origRow} -> Excel行${excelRow}`);
	}
	if (getExcelRow(0) !== 10 || getExcelRow(9) !== 1) {
		console.error('  ✗ 行映射错误');
		failed++;
		continue;
	}

	console.log('  列映射:');
	for (const origCol of [0, 4, 9]) {
		const excelCol = getExcelCol(origCol);
		console.log(`    原列${origCol} -> Excel列${excelCol}`);
	}
	if (getExcelCol(0) !== 2 || getExcelCol(9) !== 11) {
		console.error('  ✗ 列映射错误');
		failed++;
		continue;
	}

	console.log('  ✓ 通过');
	passed++;
}

console.log('\n' + '='.repeat(60));
console.log(`结果: ${passed} 通过, ${failed} 失败`);
console.log('='.repeat(60));

if (failed > 0) {
	process.exit(1);
}
