//B"H
# Shabbos Mode

Designs that respect Shabbos: no animations, no interactive elements, static beautiful pages. Fully usable without JavaScript.

Shabbos mode is **not** a degraded page — it is a holier one: still, warm, focused, peaceful. Like an open sefer.

## What it does

1. **Shabbos flag** — one class (`.shabbos-mode`) on `<html>`: all animations die, transitions die, smooth scroll dies; interactive chrome (nav menus, forms, comments, carousels, modals, share buttons, video/audio) hides; collapsed content (accordions, tabs, `<details>`) expands so nothing is hidden behind a click.
2. **Auto-detect** — pure solar math (NOAA algorithm, no external API) computes Friday sunset for any lat/lon; candle lighting defaults to 18 min before, havdalah 50 min after Saturday sunset. The client script offers "Enter Shabbos mode" ~90 min before, and auto-enters during Shabbos.
3. **Beautiful static** — warm paper (`#faf5ea`), sefer serif stack with Hebrew support, generous 1.9 line-height, centered 42em reading column, candle notice banner (`🕯️🕯️ שבת שלום`).
4. **Print-ready** — `@media print` rules: clean margins, no break orphans, link URLs printed, footnotes intact. People print for Shabbos.

## Usage

Server-side (works with JS disabled — the real Shabbos guarantee):

```js
import { renderShabbosPage, getShabbosWindow } from "./index.mjs";

// Whole page transform:
const shabbosHtml = renderShabbosPage(pageHtml, {
  lat: 31.7683, lon: 35.2137,   // Jerusalem
  utcOffsetMin: 180,             // UTC+3
  candleLightingMin: 18,
  havdalahMin: 50,
});

// Just the window:
const w = getShabbosWindow({ lat: 31.7683, lon: 35.2137, utcOffsetMin: 180 });
w.inShabbos; // boolean
```

Client-side (progressive enhancement — page already works without it):

```html
<html data-shabbos-lat="31.7683" data-shabbos-lon="35.2137">
<script>
  window.AWT_SHABBOS = { lat: 31.7683, lon: 35.2137, offerBeforeMin: 90 };
</script>
```

Or let the inline script from `renderShabbosPage` handle it — it reads baked config, offers the banner before Shabbos, auto-enters during Shabbos, remembers manual toggles in localStorage, and wires any `.shabbos-toggle` button.

## Modules

| File | Purpose |
|---|---|
| `SPEC.mjs` | Interface shapes, defaults, constants |
| `times.mjs` | `sunsetUTCms`, `getShabbosWindow` — pure, embeddable in the client |
| `css.mjs` | `shabbosCss(opts)`, `printCss(opts)` — the still, warm stylesheet |
| `html.mjs` | `applyShabbosHtml` — server transform: class, CSS, details, notice, scripts |
| `script.mjs` | `shabbosClientScript(opts)` — browser JS (embeds time fns verbatim) |
| `index.mjs` | Facade: `renderShabbosPage` |

## Tests

```bash
cd geelooy/apps/tunnel/design-os/shabbos-mode
node tests/times.test.mjs   # 7 tests — solar math, windows, offsets
node tests/css.test.mjs     # 7 tests — motion kill, scoping, print
node tests/html.test.mjs    # 10 tests — transform end to end
```

24 tests, all passing.

## Design principles

- **Stillness as design.** Motion is weekday energy. On Shabbos the page rests.
- **Nothing hidden behind a click.** If it needed JavaScript to reveal, it is revealed.
- **The white fire.** Generous space is not empty — it is holy.
- **Print is eternal.** The web flickers; the printed page sits on the table all Shabbos.
