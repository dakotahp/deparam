# deparam Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Jekyll/jQuery/Foundation stack with a single-page vanilla HTML/CSS/JS tool that deparameterizes URLs into a Dracula-themed split-pane table with CRT scanline animation.

**Architecture:** Three files — `index.html` (markup shell), `style.css` (all visual styles including animations), `app.js` (all behavior: parse, render, scanline, sort). No dependencies, no build step.

**Tech Stack:** Vanilla HTML5, CSS custom properties, vanilla ES5-compatible JS. GitHub Pages static hosting.

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Markup shell: input bar, split pane, table structure, hint elements |
| `style.css` | Reset, CSS vars (Dracula palette), layout (split grid), input glow, table styles, cursor blink, scanline animation, row reveal animation |
| `app.js` | `parseUrl()`, `decode()`, `makeSpan()`, `renderRaw()`, `renderTable()`, `triggerScanline()`, `clearPanes()`, `toggleSort()`, `applySortState()`, input event handler |

**Deleted:**
- `_layouts/`, `_assets/`, `css/`, `js/`, `_config.yml`, `build-sass`, `serve`, `stupidtable.min.js`, `googleabad8f5c4a056069.html`, `sitemap.xml`, `robots.txt`

---

## Task 1: Delete old files

**Files:**
- Delete: `_layouts/`, `_assets/`, `css/`, `js/`
- Delete: `_config.yml`, `build-sass`, `serve`, `stupidtable.min.js`
- Delete: `googleabad8f5c4a056069.html`, `sitemap.xml`, `robots.txt`

- [ ] **Step 1: Remove old directories and files**

```bash
rm -rf _layouts _assets css js
rm -f _config.yml build-sass serve stupidtable.min.js
rm -f googleabad8f5c4a056069.html sitemap.xml robots.txt
```

- [ ] **Step 2: Verify what remains**

```bash
ls
```

Expected output — only these should remain:
```
CNAME
LICENSE.md
README.md
docs/
images/
index.html   ← old one, will be replaced in Task 2
```

- [ ] **Step 3: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove old Jekyll/Foundation/jQuery stack"
```

---

## Task 2: Create `index.html`

**Files:**
- Create: `index.html` (replaces old one)

- [ ] **Step 1: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>deparam</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="app">
    <header class="app-header">
      <h1 class="app-title">deparam</h1>
    </header>

    <div class="input-wrap">
      <input
        type="text"
        id="url-input"
        class="url-input"
        placeholder="Paste URL here…"
        autocomplete="off"
        spellcheck="false"
        autofocus
      >
      <span class="cursor-block" aria-hidden="true"></span>
    </div>

    <div class="split-pane">
      <section class="pane pane-raw" aria-label="Raw URL">
        <div class="pane-header">Raw URL</div>
        <div class="pane-body" id="raw-output">
          <span class="hint">Paste a URL above</span>
        </div>
      </section>

      <section class="pane pane-table" aria-label="Parsed parameters">
        <div class="pane-header">Parsed</div>
        <div class="pane-body table-wrap">
          <span class="hint" id="table-hint">Paste a URL above</span>
          <span class="hint hidden" id="no-params-hint">No parameters found</span>
          <table id="params-table" class="hidden">
            <thead>
              <tr>
                <th id="sort-key" class="col-key sortable" aria-sort="none">
                  Key <span class="sort-indicator" aria-hidden="true"></span>
                </th>
                <th class="col-val">Value</th>
              </tr>
            </thead>
            <tbody id="params-body"></tbody>
          </table>
        </div>
      </section>
    </div>
  </main>

  <footer class="app-footer">
    <a href="https://github.com/dakotahp/deparam" class="footer-link">source</a>
  </footer>

  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `index.html` directly in a browser (no server needed). Expected: plain unstyled page, input field present, "Paste a URL above" text visible in both panes, no JS errors in console.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add HTML markup shell"
```

---

## Task 3: Create `style.css` — layout and base

**Files:**
- Create: `style.css`

- [ ] **Step 1: Write `style.css` with reset, variables, and layout**

```css
/* ── Reset ─────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Custom properties (Dracula palette) ────────────── */
:root {
  --bg:          #13111a;
  --surface:     #1a1826;
  --surface-alt: #1e1a2e;
  --border:      #44475a;
  --border-dim:  #2e2b3e;
  --pink:        #ff79c6;
  --cyan:        #8be9fd;
  --green:       #50fa7b;
  --yellow:      #f1fa8c;
  --muted:       #6272a4;
  --dim:         #44475a;
  --text:        #f8f8f2;

  --glow-pink:   0 0 10px #ff79c688;
  --glow-cyan:   0 0 8px  #8be9fd66;
  --glow-green:  0 0 8px  #50fa7b66;
  --glow-yellow: 0 0 8px  #f1fa8c66;

  --font-mono: 'SF Mono', ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
}

/* ── Base ───────────────────────────────────────────── */
html, body {
  height: 100%;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── App shell ──────────────────────────────────────── */
.app {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 16px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* ── Header ─────────────────────────────────────────── */
.app-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .18em;
  color: var(--pink);
  text-shadow: var(--glow-pink);
  font-weight: 600;
}

/* ── Input bar ──────────────────────────────────────── */
.input-wrap {
  position: relative;
}

.url-input {
  width: 100%;
  background: var(--surface-alt);
  border: 1px solid var(--pink);
  border-radius: 4px;
  padding: 12px 40px 12px 16px;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 13px;
  outline: none;
  box-shadow: var(--glow-pink);
  caret-color: transparent;
  transition: box-shadow .2s;
}

.url-input::placeholder {
  color: var(--muted);
}

.url-input:focus {
  box-shadow: 0 0 16px #ff79c666;
  caret-color: var(--pink);
}

/* ── Split pane ─────────────────────────────────────── */
.split-pane {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
}

.pane {
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.pane-header {
  padding: 6px 12px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--pink);
  text-shadow: var(--glow-pink);
  flex-shrink: 0;
}

.pane-body {
  padding: 12px;
  font-size: 12px;
  line-height: 1.8;
  word-break: break-all;
  overflow-y: auto;
  flex: 1;
}

/* ── Footer ─────────────────────────────────────────── */
.app-footer {
  padding: 8px 24px 16px;
  text-align: center;
}

.footer-link {
  font-size: 10px;
  color: var(--dim);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: .1em;
  transition: color .2s;
}

.footer-link:hover {
  color: var(--pink);
  text-shadow: var(--glow-pink);
}
```

- [ ] **Step 2: Verify layout in browser**

Reload `index.html`. Expected:
- Black/near-black background, small pink "deparam" label top-left
- Full-width input with pink glow border
- Two equal-width pane columns below the input, each with "Raw URL" / "Parsed" pink header
- "Paste a URL above" visible in each pane body
- Footer "source" link at bottom

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add layout and base styles"
```

---

## Task 4: Add visual design to `style.css`

**Files:**
- Modify: `style.css` (append to end of file)

- [ ] **Step 1: Append visual styles for raw pane, table, hints, and cursor**

Append to the bottom of `style.css`:

```css
/* ── Raw URL pane colors ────────────────────────────── */
.raw-base    { color: var(--muted); }
.raw-key     { color: var(--cyan);   text-shadow: var(--glow-cyan);   }
.raw-eq      { color: var(--dim);    }
.raw-val     { color: var(--green);  text-shadow: var(--glow-green);  }
.raw-val.num { color: var(--yellow); text-shadow: var(--glow-yellow); }
.raw-amp     { color: var(--dim);    }

/* ── Hints ──────────────────────────────────────────── */
.hint {
  color: var(--muted);
  font-style: italic;
  font-size: 12px;
}

.hidden {
  display: none;
}

/* ── Table wrapper ──────────────────────────────────── */
.table-wrap {
  position: relative;
  padding: 0;
  overflow: hidden;
}

/* ── Table ──────────────────────────────────────────── */
#params-table {
  width: 100%;
  border-collapse: collapse;
}

#params-table thead th {
  padding: 7px 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--pink);
  text-shadow: var(--glow-pink);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  text-align: left;
}

.col-key { width: 35%; }
.col-val { width: 65%; }

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  color: var(--cyan);
  text-shadow: var(--glow-cyan);
}

.sort-indicator {
  display: inline-block;
  width: 14px;
}

/* ── Table rows ─────────────────────────────────────── */
.params-row td {
  padding: 7px 12px;
  font-size: 12px;
  border-bottom: 1px solid var(--border-dim);
  vertical-align: top;
}

.params-row:nth-child(even) td {
  background: var(--surface);
}

.params-row:last-child td {
  border-bottom: none;
}

.td-key {
  color: var(--cyan);
  text-shadow: var(--glow-cyan);
}

.td-val {
  color: var(--green);
  text-shadow: var(--glow-green);
  word-break: break-all;
}

.td-val.num {
  color: var(--yellow);
  text-shadow: var(--glow-yellow);
}

.td-val.empty {
  color: var(--dim);
  font-style: italic;
  text-shadow: none;
}

/* ── Blinking block cursor ──────────────────────────── */
.cursor-block {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 9px;
  height: 16px;
  background: var(--pink);
  box-shadow: var(--glow-pink);
  animation: blink 1s step-end infinite;
  pointer-events: none;
}

.input-wrap:focus-within .cursor-block {
  display: none;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
```

- [ ] **Step 2: Verify in browser**

Reload. Expected:
- Pink glow on the input border
- Blinking pink block cursor at right of the input (disappears when you click into the field)
- Table is still hidden (it will appear in Task 6)
- No CSS parse errors in devtools

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add Dracula palette, glow effects, table styles, cursor"
```

---

## Task 5: Add animations to `style.css`

**Files:**
- Modify: `style.css` (append to end of file)

- [ ] **Step 1: Append animation styles**

Append to the bottom of `style.css`:

```css
/* ── Row reveal animation ───────────────────────────── */
/* Rows start invisible. JS adds .revealed to kick off the staggered fade. */
.params-row {
  opacity: 0;
}

@keyframes rowReveal {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.params-row.revealed {
  animation: rowReveal 80ms ease-out forwards;
  animation-delay: var(--row-delay, 0ms);
}

/* ── CRT scanline ───────────────────────────────────── */
/* JS appends a .scanline div to <body>, sized/positioned via inline styles
   derived from paramsBody.getBoundingClientRect().                        */
.scanline {
  position: fixed;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--pink)  30%,
    var(--cyan)  70%,
    transparent  100%
  );
  box-shadow: 0 0 12px 4px #ff79c688;
  pointer-events: none;
  z-index: 100;
  animation: scanSweep 320ms ease-in forwards;
}

@keyframes scanSweep {
  from { transform: translateY(0); }
  to   { transform: translateY(var(--sweep-distance, 200px)); }
}
```

- [ ] **Step 2: Verify (no visible change yet)**

Reload. No visible change expected — animations only fire from JS. Confirm no CSS errors in devtools.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add scanline and row-reveal CSS animations"
```

---

## Task 6: Create `app.js`

**Files:**
- Create: `app.js`

All DOM manipulation uses `textContent` or explicit `createElement` / `appendChild` — never `innerHTML` with dynamic content — so no XSS surface exists.

- [ ] **Step 1: Write `app.js`**

```js
(function () {
  'use strict';

  // ── DOM refs ────────────────────────────────────────
  var input         = document.getElementById('url-input');
  var rawOutput     = document.getElementById('raw-output');
  var paramsBody    = document.getElementById('params-body');
  var tableEl       = document.getElementById('params-table');
  var tableHint     = document.getElementById('table-hint');
  var noParamsHint  = document.getElementById('no-params-hint');
  var sortKeyTh     = document.getElementById('sort-key');
  var sortIndicator = sortKeyTh.querySelector('.sort-indicator');

  // ── State ───────────────────────────────────────────
  var sortState      = 'none'; // 'none' | 'asc' | 'desc'
  var originalParams = [];

  // ── Helpers ─────────────────────────────────────────
  function decode(str) {
    try { return decodeURIComponent(str.replace(/\+/g, ' ')); }
    catch (_) { return str; }
  }

  function makeSpan(cls, text) {
    var s = document.createElement('span');
    s.className = cls;
    s.textContent = text;
    return s;
  }

  function showHint(el) {
    el.classList.remove('hidden');
  }

  function hideHint(el) {
    el.classList.add('hidden');
  }

  // ── Parse ───────────────────────────────────────────
  // Returns { base, params: [{rawKey, rawVal, key, value}] }
  //   base   — everything up to and including '?', or full string if no '?'
  //   rawKey — original percent-encoded key   (for raw pane display)
  //   rawVal — original percent-encoded value (for raw pane display)
  //   key    — decoded key   (for table)
  //   value  — decoded value (for table)
  function parseUrl(raw) {
    var qIdx = raw.indexOf('?');
    if (qIdx === -1) return { base: raw, params: [] };

    var base = raw.slice(0, qIdx + 1);
    var qs   = raw.slice(qIdx + 1);

    var params = qs.split('&').map(function (part) {
      var eqIdx = part.indexOf('=');
      if (eqIdx === -1) {
        return { rawKey: part, rawVal: '', key: decode(part), value: '' };
      }
      return {
        rawKey: part.slice(0, eqIdx),
        rawVal: part.slice(eqIdx + 1),
        key:    decode(part.slice(0, eqIdx)),
        value:  decode(part.slice(eqIdx + 1)),
      };
    }).filter(function (p) { return p.rawKey !== ''; });

    return { base: base, params: params };
  }

  // ── Render: raw pane ────────────────────────────────
  // Uses rawKey/rawVal so the original encoded form is shown.
  // All content set via textContent — no XSS risk.
  function renderRaw(base, params) {
    while (rawOutput.firstChild) rawOutput.removeChild(rawOutput.firstChild);

    rawOutput.appendChild(makeSpan('raw-base', base));

    if (params.length === 0) return;

    params.forEach(function (p, i) {
      var isNum = p.value !== '' && !isNaN(Number(p.value));
      rawOutput.appendChild(makeSpan('raw-key', p.rawKey));
      rawOutput.appendChild(makeSpan('raw-eq',  '='));
      rawOutput.appendChild(makeSpan('raw-val' + (isNum ? ' num' : ''), p.rawVal));
      if (i < params.length - 1) {
        rawOutput.appendChild(makeSpan('raw-amp', '&'));
      }
    });
  }

  // ── Render: table ───────────────────────────────────
  function renderTable(params) {
    while (paramsBody.firstChild) paramsBody.removeChild(paramsBody.firstChild);

    if (params.length === 0) {
      tableEl.classList.add('hidden');
      hideHint(tableHint);
      showHint(noParamsHint);
      return;
    }

    tableEl.classList.remove('hidden');
    hideHint(tableHint);
    hideHint(noParamsHint);

    var sorted = applySortState(params);

    sorted.forEach(function (p, i) {
      var tr = document.createElement('tr');
      tr.className = 'params-row revealed';
      // Stagger rows 50ms apart; cap at 350ms so the last row never
      // exceeds the 500ms animation budget even for long URLs.
      tr.style.setProperty('--row-delay', Math.min(i * 50, 350) + 'ms');

      var keyTd = document.createElement('td');
      keyTd.className = 'td-key';
      keyTd.textContent = p.key;

      var isEmpty = p.value === '';
      var isNum   = !isEmpty && !isNaN(Number(p.value));
      var valTd   = document.createElement('td');
      valTd.className = 'td-val' + (isEmpty ? ' empty' : isNum ? ' num' : '');
      valTd.textContent = isEmpty ? '(empty)' : p.value;

      tr.appendChild(keyTd);
      tr.appendChild(valTd);
      paramsBody.appendChild(tr);
    });

    triggerScanline();
  }

  // ── Scanline ────────────────────────────────────────
  // Appends a fixed-position div to <body> sized to sit exactly over
  // the tbody. Uses getBoundingClientRect() so it works regardless of
  // scroll position. Removes itself on animationend.
  function triggerScanline() {
    var existing = document.querySelector('.scanline');
    if (existing) existing.remove();

    var rect = paramsBody.getBoundingClientRect();
    if (rect.height === 0) return;

    var line = document.createElement('div');
    line.className = 'scanline';
    line.style.top    = rect.top  + 'px';
    line.style.left   = rect.left + 'px';
    line.style.width  = rect.width + 'px';
    line.style.setProperty('--sweep-distance', rect.height + 'px');
    document.body.appendChild(line);

    line.addEventListener('animationend', function () {
      line.remove();
    });
  }

  // ── Sort ────────────────────────────────────────────
  function applySortState(params) {
    if (sortState === 'none') return params.slice();
    var sorted = params.slice().sort(function (a, b) {
      return a.key.localeCompare(b.key);
    });
    return sortState === 'asc' ? sorted : sorted.reverse();
  }

  function resetSortIndicator() {
    sortState = 'none';
    sortIndicator.textContent = '';
    sortKeyTh.setAttribute('aria-sort', 'none');
  }

  function toggleSort() {
    if (sortState === 'none') {
      sortState = 'asc';
      sortIndicator.textContent = ' ▲';
      sortKeyTh.setAttribute('aria-sort', 'ascending');
    } else if (sortState === 'asc') {
      sortState = 'desc';
      sortIndicator.textContent = ' ▼';
      sortKeyTh.setAttribute('aria-sort', 'descending');
    } else {
      resetSortIndicator();
    }
    renderTable(originalParams);
  }

  // ── Clear ───────────────────────────────────────────
  function clearPanes() {
    while (rawOutput.firstChild) rawOutput.removeChild(rawOutput.firstChild);
    rawOutput.appendChild(makeSpan('hint', 'Paste a URL above'));

    while (paramsBody.firstChild) paramsBody.removeChild(paramsBody.firstChild);
    tableEl.classList.add('hidden');
    showHint(tableHint);
    hideHint(noParamsHint);
    resetSortIndicator();
    originalParams = [];
  }

  // ── Input handler ────────────────────────────────────
  input.addEventListener('input', function () {
    var raw = input.value.trim();

    if (raw === '') {
      clearPanes();
      return;
    }

    var parsed = parseUrl(raw);
    originalParams = parsed.params;
    resetSortIndicator();

    renderRaw(parsed.base, parsed.params);
    renderTable(parsed.params);
  });

  sortKeyTh.addEventListener('click', toggleSort);

}());
```

- [ ] **Step 2: Verify parse logic in browser console**

Open `index.html`, open devtools console, paste and run:

```js
(function () {
  function decode(s) { try { return decodeURIComponent(s.replace(/\+/g,' ')); } catch(_){return s;} }
  function parseUrl(raw) {
    var q = raw.indexOf('?');
    if (q === -1) return { base: raw, params: [] };
    var base = raw.slice(0, q+1), qs = raw.slice(q+1);
    var params = qs.split('&').map(function(part) {
      var e = part.indexOf('=');
      if (e === -1) return { rawKey:part, rawVal:'', key:decode(part), value:'' };
      return { rawKey:part.slice(0,e), rawVal:part.slice(e+1), key:decode(part.slice(0,e)), value:decode(part.slice(e+1)) };
    }).filter(function(p){ return p.rawKey !== ''; });
    return { base:base, params:params };
  }

  var r1 = parseUrl('http://example.com');
  console.assert(r1.params.length === 0,            'no params when no ?');
  console.assert(r1.base === 'http://example.com',  'base is full url when no ?');

  var r2 = parseUrl('http://example.com?a=1&b=hello');
  console.assert(r2.params.length === 2,   '2 params');
  console.assert(r2.params[0].key === 'a', 'first key');
  console.assert(r2.params[0].value === '1', 'first value');

  var r3 = parseUrl('http://example.com?title=Foo%20Bar&ref=');
  console.assert(r3.params[0].value === 'Foo Bar', 'decodes %20');
  console.assert(r3.params[1].value === '',         'empty value');

  var r4 = parseUrl('http://example.com?token=abc=def==');
  console.assert(r4.params[0].value === 'abc=def==', 'splits on first = only');

  console.log('All parse assertions passed.');
})();
```

Expected: `All parse assertions passed.`

- [ ] **Step 3: Verify full UI in browser**

Paste into the input:
```
//wh.consumersource.com/wtd.gif?type=pageview&utm_source=google&session_id=1390949743367&ref=&title=Foo%20Bar
```

Expected:
- Left pane: base path muted gray, keys cyan+glow, `=` dim, values green+glow, `&` dim; `1390949743367` yellow (numeric)
- Right pane: scanline sweeps across tbody from top to bottom (320ms), rows fade in staggered behind it
- `ref` row shows `(empty)` in muted italic
- `title` row shows decoded `Foo Bar` (not `Foo%20Bar`)
- Clearing the input restores hint text in both panes and hides the table

- [ ] **Step 4: Verify sort**

With a URL parsed, click the **Key** header:
1. ▲ appears, rows sort A→Z, scanline fires
2. Click again: ▼ appears, rows sort Z→A, scanline fires
3. Click again: indicator clears, original order restored, scanline fires

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: add parse, render, scanline, and sort logic"
```

---

## Task 7: Final verification and cleanup

**Files:**
- Modify: `README.md`
- Check: `CNAME`
- Create/modify: `.gitignore`

- [ ] **Step 1: Check CNAME**

```bash
cat CNAME
```

If you want to keep the custom domain, leave it. To use the default GitHub Pages URL (`dakotahp.github.io/deparam`), delete it:

```bash
rm CNAME
```

- [ ] **Step 2: Update README.md**

Replace the full contents of `README.md`:

```markdown
# deparam

Paste a URL. See its query parameters in a readable table.

https://deparam.teardrop.co
```

- [ ] **Step 3: Add `.superpowers/` to `.gitignore`**

```bash
echo '.superpowers/' >> .gitignore
```

- [ ] **Step 4: Smoke test checklist**

Open `index.html` locally. Verify each item:

- [ ] Blinking pink block cursor visible before clicking input; disappears on focus (native caret takes over)
- [ ] Pasting a URL instantly renders both panes
- [ ] Left pane: base path muted, keys cyan+glow, values green+glow, numbers yellow+glow, `&`/`=` dimmed
- [ ] Right pane: scanline sweeps tbody top-to-bottom in ~320ms, rows stagger-fade in behind it
- [ ] Empty values show `(empty)` in muted italic
- [ ] URL-encoded values decoded in table (`%20` → space, `%26` → `&`)
- [ ] Values containing `=` parse correctly (`token=abc=def` → key `token`, value `abc=def`)
- [ ] URL with no `?`: left pane shows full muted URL, right pane shows "No parameters found"
- [ ] Clearing input restores both panes to "Paste a URL above" hint, hides table
- [ ] Key header cycles: unsorted → ▲ A-Z → ▼ Z-A → unsorted; scanline fires on each

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete deparam redesign — vanilla HTML/CSS/JS, Dracula synthwave"
```

---

## Spec Coverage Check

| Spec requirement | Task |
|-----------------|------|
| Delete old stack | Task 1 |
| `index.html` markup shell | Task 2 |
| `style.css` separate file | Tasks 3–5 |
| `app.js` separate file | Task 6 |
| Dracula palette + strong glow | Task 4 |
| Full-width input bar | Task 3 |
| Blinking block cursor (hides on focus) | Task 4 |
| Split pane layout | Task 3 |
| Raw URL pane with color highlights | Task 6 |
| Parsed table (Key / Value) | Task 6 |
| CRT scanline animation 320ms | Tasks 5, 6 |
| Row stagger 50ms intervals, cap 350ms | Task 6 |
| Numeric values colored yellow | Tasks 4, 6 |
| Empty values shown as `(empty)` | Task 6 |
| Sort toggle on Key header | Task 6 |
| Sort resets on new parse | Task 6 |
| No localStorage, no hash sharing | n/a — intentionally omitted |
| Decodes URL-encoded values | Task 6 (`decode()`) |
| Splits on first `=` only | Task 6 (`parseUrl()`) |
| "No parameters found" message | Task 6 |
| GitHub Pages compatible | Task 7 |
