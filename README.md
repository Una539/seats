# Seats — Classroom Seat Assignment Manager

A modern, privacy-first classroom seat assignment tool. Assign students to seats, manage aisles, handle bulk operations, and export to Excel — all running entirely in your browser with zero third-party tracking.

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
| **Offline capable**     | Pure client-side Svelte app; works offline after first load                                   |
| **Privacy-first**       | Zero third-party tracking, no server required                                                 |

---

## Project Structure

```
seats/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ColumnControls.svelte   # Column toggle buttons (aisle/swap)
│   │   │   ├── FileUpload.svelte        # File upload + random fill + export
│   │   │   ├── NameList.svelte          # Student name list with selection
│   │   │   └── SeatGrid.svelte          # 10x10 seat grid table
│   │   ├── stores.svelte.ts             # SeatGridState class (all grid logic)
│   │   ├── types.ts                     # TypeScript type definitions
│   │   ├── export.ts                    # Excel export (ExcelJS)
│   │   └── index.ts                     # Library entry point
│   ├── routes/
│   │   ├── +layout.svelte               # Root layout
│   │   ├── +layout.ts                  # Preload configuration
│   │   └── +page.svelte                # Main page (state orchestration)
│   ├── app.css                         # Design tokens & global styles
│   ├── app.html                        # HTML template
│   └── app.d.ts                        # TypeScript declarations
├── static/
│   ├── names.txt                       # Default student list (optional)
│   ├── CNAME                           # Custom domain config
│   ├── robots.txt                      # Crawler config
│   └── .nojekyll                       # Jekyll bypass for GitHub Pages
├── svelte.config.js                    # SvelteKit configuration
├── vite.config.ts                      # Vite build configuration
├── tsconfig.json                       # TypeScript configuration
└── package.json                        # Dependencies & scripts
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

Click the mode toggle in the sidebar to switch between:

- **填座 (Fill)**: Default mode for assigning and swapping students
- **移除 (Remove)**: Safe mode for removing students from seats

### Assigning Students

1. Click a name in the **右侧名单** (right sidebar list) to select it
2. Click any **empty cell** in the grid to assign that student
3. The name disappears from the list after assignment

### Swapping Two Students

1. In **填座** mode, click a **filled cell** — it highlights as "swap selected"
2. Click another **filled cell** to swap the two students
3. A brief flash animation confirms the swap

### Removing a Student

1. Switch to **移除** mode (red underline indicator)
2. Click a **filled cell** — it turns red to confirm
3. Click again to confirm removal; the name returns to the list

### Managing Aisles

Click the column buttons above the grid to toggle a column as an **aisle**:

- Aisles cannot hold students
- Any student in that column is displaced back to the list
- The column button turns dark to indicate aisle status

### Bulk Enable/Disable Seats

In **填座** mode with no name selected:

1. Click an **empty cell** to start a batch selection
2. Click another cell to define a rectangle — all empty cells in that area highlight
3. Click once more to **confirm and disable** all highlighted cells

To re-enable disabled seats:

1. Click a **disabled cell** — it highlights in amber
2. Click another cell to define the batch area
3. Click again to **confirm and enable** all cells

### Random Fill

Click **随机填入** in the sidebar to automatically distribute all names in the list to random available seats.

### Export to Excel

Click **导出 Excel** to download the current seat map as a `.xlsx` file.

---

## Tech Stack

- **Framework**: SvelteKit (Svelte 5)
- **Language**: TypeScript
- **Build tool**: Vite
- **Styling**: CSS with design tokens
- **Excel export**: ExcelJS

---

## Quick Start

```sh
pnpm install
pnpm dev
```

## Development Commands

| Command        | Description                      |
| -------------- | -------------------------------- |
| `pnpm dev`     | Start dev server with hot reload |
| `pnpm check`   | Type-check and lint              |
| `pnpm format`  | Format code                      |
| `pnpm build`   | Build for production             |
| `pnpm preview` | Preview production build locally |

The build output is static — deploy `/build` to any static host.

---

## License

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0-or-later).
See the [LICENSE](LICENSE) file for details.

Copyright (C) 2026 Una
