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
 * 测试运行器
 * 运行所有测试文件并汇总结果
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const testsDir = path.dirname(__filename);

const testFiles = [
	{ name: 'SeatGridState 状态管理', file: 'test-stores.test.js' },
	{ name: '导出功能核心逻辑', file: 'test-export.test.js' },
	{ name: 'i18n 国际化', file: 'test-i18n.test.js' }
];

let totalPassed = 0;
let totalFailed = 0;
let suiteFailed = 0;

console.log('============================================================');
console.log('Seats - 测试运行器');
console.log(`运行时间: ${new Date().toLocaleString('zh-CN')}`);
console.log('============================================================');
console.log('');

for (const test of testFiles) {
	const filePath = path.join(testsDir, test.file);
	console.log(`\n运行测试: ${test.name}`);
	console.log(`文件: ${test.file}`);
	console.log('-'.repeat(60));

	try {
		const output = execSync(`node "${filePath}"`, {
			encoding: 'utf-8',
			cwd: testsDir
		});
		console.log(output);

		// 解析结果行
		const resultMatch = output.match(/结果:\s*(\d+)\s*通过,\s*(\d+)\s*失败/);
		if (resultMatch) {
			const passed = parseInt(resultMatch[1], 10);
			const failed = parseInt(resultMatch[2], 10);
			totalPassed += passed;
			totalFailed += failed;
		}
	} catch (error) {
		suiteFailed++;
		totalFailed++;
		console.log(error.stdout || '');
		console.log(`\n  ✗ 测试套件 "${test.name}" 执行失败`);
		if (error.stderr) {
			console.log(`  错误: ${error.stderr.trim()}`);
		}
	}
}

// ============================================================
// 最终汇总
// ============================================================

console.log('\n');
console.log('============================================================');
console.log('最终结果');
console.log('============================================================');
console.log(`  测试套件: ${testFiles.length - suiteFailed}/${testFiles.length} 通过`);
console.log(`  测试用例: ${totalPassed} 通过, ${totalFailed} 失败`);
console.log('============================================================');

if (totalFailed > 0 || suiteFailed > 0) {
	process.exit(1);
}
