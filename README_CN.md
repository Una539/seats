# Seats — 教室座位分配管理工具

一个现代化的、注重隐私的教室座位分配工具。在浏览器中完成学生座位分配、过道管理、批量操作和 Excel 导出，无任何第三方追踪。

**[English](./README.md) | 中文**

## 功能

- **点击式座位分配** — 点击姓名，再点击空格，即可填入。也可一键随机分配
- **过道管理** — 将整列标记为过道，被清退的学生自动归还名单
- **交换/移除模式** — 两种独立模式，视觉反馈清晰，操作安全
- **批量启用/禁用** — 框选或双击即可批量管理座位可用性
- **Excel 导出** — 将座位表导出为 `.xlsx` 文件，直接打印使用
- **设计令牌系统** — 简洁中性的界面，一致的间距、颜色和动效
- **无需服务器** — 纯前端 Svelte 应用，首次加载后可离线使用

## 开发

```sh
# 安装依赖
pnpm install

# 启动开发服务器（热重载）
pnpm dev

# 类型检查和代码检查
pnpm check
pnpm lint

# 格式化代码
pnpm format
```

## 构建

```sh
pnpm build

# 本地预览生产版本
pnpm preview
```

构建产物是纯静态文件，可部署到任意静态托管服务。

## 部署到 GitHub Pages

项目已提供 GitHub Action 工作流 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)。推送到 `main` 分支将自动构建并部署到 GitHub Pages。

启用方式：

1. 进入 **Settings → Pages → Source**
2. 选择 **GitHub Actions** 作为来源
3. 推送到 `main` 分支，工作流将自动部署

## 部署到自己的服务器

构建静态站点后，使用任意静态文件服务器托管：

```sh
pnpm build
```

这会在 `/build` 目录生成构建产物。用以下方式托管：

```sh
# 使用 Python
cd build && python -m http.server 8080

# 使用 Node.js (http-server)
npx http-server -p 8080 ./build

# 使用 nginx（示例配置）
server {
    listen 80;
    root /path/to/seats/build;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
```

若使用 SvelteKit 的 SPA 模式（客户端路由），需确保所有非静态资源请求回退到 `index.html`：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 许可证

本项目采用 **GNU Affero 通用公共许可证 v3.0**（AGPL-3.0-or-later）。
详见 [LICENSE](LICENSE) 文件。

版权所有 (C) 2026 Una
