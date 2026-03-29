# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A single-page URL deparameterizer. Paste a URL, see its query parameters in a split-pane table. Hosted on GitHub Pages at `deparam.dakotahpena.dev`.

## Development

No build step. Serve the root directory with any static file server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

Open `http://localhost:8080`. Do not open `index.html` via `file://` — `getBoundingClientRect()` used for the scanline animation requires an HTTP context.

## Architecture

Three files, no dependencies:

- **`index.html`** — markup shell only. All IDs (`url-input`, `raw-output`, `params-body`, `params-table`, `table-hint`, `no-params-hint`, `sort-key`) are referenced by `app.js`. Do not rename them.
- **`style.css`** — Dracula/synthwave theme. All colors are CSS custom properties in `:root`. Glow variables (`--glow-pink` etc.) store full `text-shadow`/`box-shadow` values, not just colors — used directly as `text-shadow: var(--glow-pink)`.
- **`app.js`** — entire behavior in one IIFE. ES5 syntax throughout.

### Data flow in `app.js`

```
input event → parseUrl() → renderRaw() + renderTable() → triggerScanline()
```

`parseUrl` returns `{ base, params: [{rawKey, rawVal, key, value}] }`. The split into `rawKey`/`rawVal` (original encoded) and `key`/`value` (decoded) is intentional: the raw pane displays the original encoding, the table displays decoded values.

`parseUrl` splits each param on the **first `=` only** (`indexOf`, not `split`) to preserve values like `token=abc=def==`.

`triggerScanline` measures `tableEl.getBoundingClientRect()` (not `tbody` — `<tbody>` rect is unreliable cross-browser) and appends a `position: fixed` `.scanline` div to `<body>`, which removes itself on `animationend`.

Sort state cycles `none → asc → desc → none` and is stored in `sortState`. `originalParams` holds the unsorted array so re-renders during sort never lose the original order. Sort is a no-op when `originalParams` is empty.

All DOM writes use `textContent` or `createElement`/`appendChild` — never `innerHTML` with dynamic content.

## Deployment

Push to `gh-pages` branch. GitHub Pages serves it directly. The `CNAME` file points to `deparam.dakotahpena.dev`.
