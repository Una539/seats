# Seats — Classroom Seat Assignment Manager

A modern, privacy-first classroom seat assignment tool. Assign students to seats, manage aisles, handle bulk operations, and export to Excel — all running entirely in your browser with zero third-party tracking.

**[中文](./README_CN.md) | English**

## Features

- **Drag-free seat assignment** — Click a name, click a cell. Or use random fill for instant distribution
- **Aisle management** — Mark columns as aisles; displaced students are automatically returned to the list
- **Swap & remove modes** — Two dedicated modes with clear visual feedback for safe editing
- **Bulk enable/disable** — Drag-select or click twice to batch-toggle seat availability
- **Excel export** — Download your seat map as a `.xlsx` file ready for printing
- **Design tokens** — Clean, neutral UI with consistent spacing, color, and motion
- **No server required** — Pure client-side Svelte app; works offline after first load

## Developing

```sh
# Install dependencies
pnpm install

# Start dev server with hot reload
pnpm dev

# Type-check and lint
pnpm check
pnpm lint

# Format code
pnpm format
```

## Building

```sh
pnpm build

# Preview production build locally
pnpm preview
```

The build output is static — deploy `/build` to any static host.

## Deploying to GitHub Pages

A GitHub Action workflow is provided at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). On push to `main`, it automatically builds and deploys to GitHub Pages.

To enable it:

1. Go to **Settings → Pages → Source**
2. Select **GitHub Actions** as the source
3. Push to `main` — the action will deploy automatically

## Deploying to Your Own Server

Build the static site and serve it with any static file server:

```sh
pnpm build
```

This produces a `/build` directory. Serve it with:

```sh
# With Python
cd build && python -m http.server 8080

# With Node.js (http-server)
npx http-server -p 8080 ./build

# With nginx (example config)
server {
    listen 80;
    root /path/to/seats/build;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
```

For SvelteKit's SPA mode (client-side routing), ensure all non-asset requests fall back to `index.html`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## License

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0-or-later).
See the [LICENSE](LICENSE) file for details.

Copyright (C) 2026 Una
