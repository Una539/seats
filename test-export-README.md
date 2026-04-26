# 导出逻辑测试

本目录包含对 `src/lib/export.ts` 中导出逻辑的验证测试。

## 测试文件

### test-export-core.js (推荐)

**核心逻辑验证测试** - 纯JavaScript，不依赖ExcelJS或浏览器API。

验证内容：

- 前门固定在左上角 (1,1)
- 后门在左侧底部（数据最底端）
- 讲桌在最下面一行（至少第11行）
- 行翻转映射：原第0行（最前排）→ Excel第10行，原第9行（最后排）→ Excel第1行
- 列偏移：原列0 → Excel列2，原列9 → Excel列11（第1列保留给门）

运行：

```bash
npm run test:export
```

### test-export-logic.js

**基础逻辑测试** - 手动实现计算函数验证。

### test-export-excel.js, test-export-full.js

**完整Excel结构测试** - 使用exceljs生成实际Excel文件并验证结构。
注意：这些测试在空表时会遇到后门覆盖前门的边缘情况。

## 设计要点

导出函数的核心逻辑：

1. **行翻转**：`excelRow = 10 - row`（老师视角：最后排显示在表格顶部）
2. **列偏移**：`excelCol = col + 2`（第1列保留给左右门）
3. **后门位置**：基于`maxDataRow`（有数据的最靠前排的Excel行号）
4. **讲桌位置**：`Math.max(11, maxDataRow + 1)`（始终在座位下方）

## 预期行为

- 有学生数据时：前门(1,1)，后门在(maxDataRow,1)，讲桌在至少第11行
- 空表时：maxDataRow=1，后门会与前端门重叠（边缘情况）
- 禁用单元格被正确跳过
