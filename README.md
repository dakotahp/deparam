# deparam

<img src="images/banner.png" width="1200" alt="deparam banner">

Paste a URL. See its query parameters in a readable table.

**https://deparam.dakotahpena.dev**

---

Originally built for debugging custom analytics platforms where dozens of tracking parameters get packed into a single URL. Useful any time you need to visually parse a complex query string without manually splitting on `&`.

## Features

- Split-pane view: original encoded URL on the left, decoded key/value table on the right
- Numeric values highlighted in yellow, empty values shown as `(empty)`
- Click the **Key** column header to sort A→Z → Z→A → original order
- CRT scanline animation on each parse
- Dracula/synthwave color theme with glow effects

## Architecture

Three files, no dependencies, no build step:

| File | Responsibility |
|------|---------------|
| `index.html` | Markup shell |
| `style.css` | Dracula palette, layout, animations |
| `app.js` | Parse, render, sort — all behavior |

`app.js` is a single IIFE. `parseUrl()` splits each param on the first `=` only, so values containing `=` (base64 tokens, signed URLs) are handled correctly. The left pane shows the original percent-encoded form; the right table shows decoded values.

## Local development

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`. A static file server is required — opening `index.html` via `file://` won't work correctly.

## Deployment

Hosted on GitHub Pages from the `gh-pages` branch. Push to deploy.
