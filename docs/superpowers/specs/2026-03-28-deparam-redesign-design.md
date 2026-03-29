# deparam redesign

**Date:** 2026-03-28
**Status:** Approved

## Overview

Full modernization of deparam — a tool that takes a long URL and breaks it into a readable key/value table. Replaces an ancient Jekyll + jQuery + Foundation stack with plain vanilla HTML/CSS/JS. Drops onto GitHub Pages with zero build step.

## What it does

User pastes a URL into an input field. The tool immediately splits the query string into a table of key/value pairs. No submit button, no page load, no state persistence — just paste and see.

## Tech stack

- `index.html` — markup only
- `style.css` — all visual styles
- `app.js` — all behavior

No dependencies. No build step. No Jekyll. No framework. Deployable to GitHub Pages with a git push.

**Deleted:** `_layouts/`, `_assets/`, `css/`, `js/`, `_config.yml`, `build-sass`, `serve`, `stupidtable.min.js`, all vendor JS.

## Visual design

**Palette:** Dracula/Synthwave on a near-black base (`#13111a`).

| Role | Color |
|------|-------|
| Background | `#13111a` |
| Surface / alt rows | `#1a1826` |
| Border | `#44475a` |
| Accent / header text | `#ff79c6` (pink) |
| Key column | `#8be9fd` (cyan) |
| Value column | `#50fa7b` (green) |
| Numeric values | `#f1fa8c` (yellow) |
| Empty values | `#44475a` (muted, italic) |
| Muted text / placeholder | `#6272a4` |

**Glow:** Text-shadow bloom applied to accent, key, and value colors (8px spread, ~40% alpha). Input border has a box-shadow glow. Headers glow at ~50% alpha.

**Typography:** System monospace stack — `'SF Mono', ui-monospace, 'Cascadia Code', monospace`.

## Layout

```
┌─────────────────────────────────────────────┐
│  [  full-width URL input bar  ▌  ]           │
├───────────────────┬─────────────────────────┤
│  Raw URL          │  Parsed                  │
│                   │  ┌──────────┬──────────┐ │
│  base/path?       │  │ Key      │ Value    │ │
│  KEY=val&         │  ├──────────┼──────────┤ │
│  KEY=val&         │  │ key      │ value    │ │
│  KEY=val          │  │ key      │ value    │ │
│                   │  └──────────┴──────────┘ │
└───────────────────┴─────────────────────────┘
```

- Input spans full width above the split
- Left pane: raw URL re-rendered with color highlights (base path muted, keys cyan, values green)
- Right pane: two-column table, Key / Value

## Components

### Input bar

- Full-width `<input type="text">` with `autofocus`
- Pink glow border (`box-shadow: 0 0 12px #ff79c644`)
- Blinking block cursor: a `<span>` sibling absolutely positioned at the right of the wrapper, CSS `animation: blink 1s step-end infinite`. Hides on `:focus-within` so the native caret takes over while typing.
- `placeholder`: `"Paste URL here…"`
- Fires on `input` event — no debounce needed (parsing is synchronous and cheap)

### Raw URL pane

- Left half of split
- On each parse, rebuilds the URL as HTML with `<span>` wrappers:
  - Base path (everything before `?`): muted gray
  - Each `key`: cyan + glow
  - Each `=`: muted
  - Each `value`: green + glow (yellow if numeric)
  - Each `&`: muted
- Empty pane state: placeholder text `"Paste a URL above"` in muted color

### Parsed table

- Right half of split
- `<table>` with `<thead>` (Key / Value) and `<tbody>` (populated on parse)
- Key header is clickable: toggles ascending → descending → original sort order
- Striped rows (alternating surface color via `:nth-child(even)`)
- Empty values rendered as `(empty)` in muted italic
- Empty pane state: hidden table, shown only after first parse
- "No params found" message if input has no `?`

### Scanline animation

- On each parse, a `<div class="scanline">` is injected at the top of `<tbody>`
- CSS: `position: absolute`, full width, 2px height, gradient glow (`#ff79c6` → `#8be9fd`)
- Animation: `top: 0` → `top: 100%` over **320ms** `ease-in`, then element is removed via `animationend` listener
- Rows start at `opacity: 0` and reveal staggered behind the scanline (50ms intervals, 80ms fade-in each)
- Total reveal time for up to 8 rows: ~490ms. Rows beyond 8 use the same delay as row 8 so they never exceed 500ms.

### Sort

- Clicking the Key `<th>` cycles: unsorted → A→Z → Z→A → unsorted
- A small indicator (▲ / ▼) appended to the header label shows current sort direction
- Sort state resets on every new parse

## Data flow

```
input event
  → if empty: clearBothPanes(), return
  → parse(rawInput)
      → extract base: everything before '?'
      → if no '?': showNoPamsMessage(), renderRaw(rawInput, []), return
      → split queryString on '&'
      → for each param: split on first '=' only, decodeURIComponent both sides
      → return { base, params: [{key, value}, …] }
  → renderRaw(base, params)   — rebuilds left pane
  → renderTable(params)       — clears tbody, builds rows, triggers scanline
  → resetSort()
```

## Files to delete

- `_layouts/`
- `_assets/`
- `css/` (old Foundation/normalize/application CSS)
- `js/` (jQuery, Modernizr, Foundation JS, vendor libs)
- `_config.yml`
- `build-sass`
- `serve`
- `stupidtable.min.js`
- `googleabad8f5c4a056069.html`
- `sitemap.xml`
- `robots.txt`
- `CNAME` (update or remove depending on domain)

## Files to create

- `index.html`
- `style.css`
- `app.js`

## Out of scope

- URL hash sharing
- localStorage persistence
- Copy-to-clipboard buttons
- Mobile-specific layout (responsive CSS is fine but no special mobile UX)
- Dark/light mode toggle
