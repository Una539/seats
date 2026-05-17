## Project Configuration

- **Language**: TypeScript (strict: `noUnusedLocals`, `noUnusedParameters`, `noEmit`)
- **Framework**: SolidJS — not React. Uses JSX with `jsxImportSource: "solid-js"`.
- **Package Manager**: pnpm
- **Build Tool**: Vite (`vite-plugin-solid`)
- **Router**: `@solidjs/router`
- **Public Dir**: `static/` (not `public/`)
- **License**: AGPL-3.0-or-later

## Developer Commands

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | `tsc && vite build` — type-checks first, then bundles to `dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | `prettier --check . && eslint .` |
| `pnpm format` | `prettier --write .` |
| `pnpm test` | Run all tests via `__tests__/run-all-tests.js` |
| `pnpm test:stores` | Run store logic tests |
| `pnpm test:export` | Run export logic tests |
| `pnpm test:i18n` | Run i18n tests |

- Tests use Node.js **native test runner**, not Vitest/Jest. Each suite is a standalone `.test.js` file.
- The custom runner executes all suites and prints a combined summary. Exit code is non-zero on failure.

## Code Style

- **Prettier**: tabs, single quotes, no trailing commas, printWidth 100.
- **ESLint**: flat config, ignores `.gitignore`, `no-undef` is off.
- **CSS**: Minimal only. Design tokens live in `src/app.css`. Do not add CSS frameworks or heavy styling libraries.

## Architecture

- **Entry**: `src/index.tsx` renders `<App />` into `#root`.
- **Routes**: `/` → `HomePage`, `/engine` → `SeatingEnginePage`.
- **Path alias**: `$lib/*` resolves to `src/lib/*` (Vite + TS paths configured).
- **State**: Store logic is in `src/lib/stores/`. Core types in `src/lib/types.ts`.
- **i18n**: English + Chinese. Locale store and translations in `src/lib/i18n/`.
- **Excel export**: Uses `exceljs`, logic in `src/lib/export.ts`.

## Deployment

- GitHub Actions auto-deploys `dist/` to GitHub Pages on every push to `main`.
- Workflow: `.github/workflows/deploy.yml`.
