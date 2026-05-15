# Seats — Classroom Seat Assignment Manager

> A modern, privacy-first classroom seat assignment tool. Assign students to seats, manage aisles, handle bulk operations, and export to Excel — all running entirely in your browser with zero third-party tracking.
>
> **Warning**: The author's frontend skills are roughly equivalent to a pigeon that just learned HTML/CSS/JS writing React. As a result, this project contains a LOT of AI-generated code. If you spot something ridiculous in the code, that's probably the AI's fault, not mine (runs away

**[中文](./README_CN.md) | English**

---

## Features

| Feature                 | Description                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| **Click-to-assign**     | Click a name, then click a cell — no drag needed. Or use random fill for instant distribution |
| **Aisle management**    | Mark columns as aisles; displaced students are automatically returned to the list             |
| **Swap & remove modes** | Two dedicated modes with clear visual feedback for safe editing                               |
| **Bulk operations**     | Drag-select or click twice to batch-toggle seat availability                                  |
| **Excel export**        | Download your seat map as a `.xlsx` file ready for printing                                   |
| **Multi-language**      | Switch between English and Chinese (简体中文) with one click; persists in localStorage        |
| **Offline capable**     | Pure client-side SolidJS app; works offline after first load                                  |
| **Privacy-first**       | Zero third-party tracking, no server required                                                 |

---

## Project Structure

```
seats/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ColumnControls.tsx    # Column toggle buttons (aisle/normal)
│   │   │   ├── FileUpload.tsx        # File upload + random fill + export
│   │   │   ├── GridCell.tsx          # Individual seat cell rendering
│   │   │   ├── ModeBar.tsx           # Fill / Remove mode toggle
│   │   │   ├── NameList.tsx          # Student name list with selection
│   │   │   ├── SeatGrid.tsx          # 10×10 seat grid table
│   │   │   └── Sidebar.tsx           # Sidebar layout (mode + file + list)
│   │   ├── i18n/
│   │   │   ├── cn.ts                 # Chinese translations
│   │   │   ├── en.ts                 # English translations
│   │   │   └── index.ts              # Locale store & reactive translator
│   │   ├── stores/
│   │   │   ├── aisleOps.ts           # Aisle column logic
│   │   │   ├── batchOps.ts           # Bulk selection operations
│   │   │   ├── cellMutations.ts      # Single-cell state mutations
│   │   │   ├── fillCell.ts           # Cell fill & swap logic
│   │   │   ├── gridState.ts          # Grid state type definitions
│   │   │   ├── randomOps.ts          # Random fill algorithm
│   │   │   ├── rectUtils.ts          # Rectangle selection utilities
│   │   │   ├── useAppState.ts        # Global app state hook
│   │   │   └── useSeatGrid.ts        # Seat grid reactive state hook
│   │   ├── types.ts                  # TypeScript type definitions
│   │   ├── export.ts                 # Excel export (ExcelJS)
│   │   └── index.ts                  # Library entry point
│   ├── App.tsx                       # Root component (grid + sidebar)
│   ├── app.css                       # Design tokens & global styles
│   ├── index.tsx                     # SolidJS app entry (render to DOM)
│   └── vite-env.d.ts                 # Vite type declarations
├── static/
│   ├── names.txt                     # Default student list (optional)
│   ├── CNAME                         # Custom domain config
│   ├── robots.txt                    # Crawler config
│   └── .nojekyll                     # Jekyll bypass for GitHub Pages
├── __tests__/
│   ├── run-all-tests.js              # Test runner
│   ├── test-export.test.js           # Export logic tests
│   ├── test-i18n.test.js             # i18n tests
│   └── test-stores.test.js           # Store logic tests
├── .github/workflows/
│   └── deploy.yml                    # Auto-deploy to GitHub Pages
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies & scripts
```

---

## Usage

### Seat Grid

The main grid displays a **10×10** table of seats. Each cell can be in one of these states:

| State        | Visual      | Description                    |
| ------------ | ----------- | ------------------------------ |
| **Empty**    | White/light | Available for assignment       |
| **Filled**   | Blue tinted | Contains a student name        |
| **Disabled** | Grayed out  | Permanently unavailable        |
| **Aisle**    | Dark column | Represents a walkway, no seats |

### Modes

Use the **mode toggle buttons** at the top of the sidebar to switch between:

- **Fill**: Assigning and swapping students
- **Remove**: Removing students from seats

### Assigning Students

1. Click a name in the **right sidebar list** to select it
2. Click any **empty cell** in the grid to assign that student
3. The name disappears from the list after assignment

### Swapping Two Students

1. In **Fill** mode, click a **filled cell** — it highlights as "swap selected"
2. Click another **filled cell** to swap the two students
3. A brief flash animation confirms the swap

### Removing a Student

1. Switch to **Remove** mode (the button turns red)
2. Click a **filled cell** — it turns red to confirm
3. Click again to confirm removal; the name returns to the list

### Managing Aisles

Click the column buttons above the grid to toggle a column as an **aisle**:

- Aisles cannot hold students
- Any student in that column is displaced back to the list
- The column button turns dark to indicate aisle status

### Bulk Enable/Disable Seats

In **Fill** mode with no name selected:

1. Click an **empty cell** to start a batch selection
2. Click another cell to define a rectangle — all empty cells in that area highlight
3. Click once more to **confirm and disable** all highlighted cells

To re-enable disabled seats:

1. Click a **disabled cell** — it highlights in amber
2. Click another cell to define the batch area
3. Click again to **confirm and enable** all cells

### Random Fill

Click **Random Fill** in the sidebar to automatically distribute all names in the list to random available seats.

### Export to Excel

Click **Export XLSX** to download the current seat map as a `.xlsx` file.

### Language Switch

Click the **language button** (EN / 中文) in the sidebar header to toggle between English and Chinese. Your preference is saved to `localStorage`.

---

## Tech Stack

- **Framework**: SolidJS
- **Language**: TypeScript
- **Build tool**: Vite
- **Styling**: CSS with design tokens
- **Excel export**: ExcelJS
- **Testing**: Node.js native test runner

> Fun fact: The CSS in this project was written by me (the AI) and the author together, so don't ask why some parts look so magical (nervous sweating

---

## Quick Start

```sh
pnpm install
pnpm dev
```

## Development Commands

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `pnpm dev`        | Start dev server with hot reload         |
| `pnpm lint`       | Run Prettier check + ESLint              |
| `pnpm format`     | Format code with Prettier                |
| `pnpm build`      | Build for production                     |
| `pnpm preview`    | Preview production build locally         |
| `pnpm test`       | Run all tests                            |
| `pnpm test:stores`| Run store logic tests                    |
| `pnpm test:export`| Run export logic tests                   |
| `pnpm test:i18n`  | Run i18n tests                           |

The build output is static — deploy `/dist` to any static host.

---

## Deployment

This project uses **GitHub Actions** to automatically build and deploy to **GitHub Pages** on every push to `main`.

Workflow file: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

---

## License

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0-or-later).
See the [LICENSE](LICENSE) file for details.

Copyright (C) 2026 Una
