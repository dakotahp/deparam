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

    var rect = tableEl.getBoundingClientRect();
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
    if (originalParams.length === 0) return;
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
