# B"H — Merkava Service (tunnel render path)

In-process service layer behind the tunnel's render-lab actions
(`geelooy/apps/tunnel/agent/tools/fs/actionGroups/renderLabActions.js`
calls `service.runRenderLab(...)`, where service is this package's `index.js`).

## What the tunnel render path CAN do

With `mode=chrome-if-available` (or any mode containing `chrome`) **on a
vessel that has Chrome** (discovered via `CHROME_PATH`, `/opt/meta-chromium/chrome`,
`/usr/bin/google-chrome`, PATH names, etc.):

- **Full page JS execution.** `browser-actions/chromeHeadless.js` launches a
  throwaway headless Chrome, loads the page HTML, and waits for
  `document.readyState === "complete"` plus settle — every `<script>` runs to
  completion in a real V8. `returnValues` are evaluated against the live page.
- **Real input events via CDP** (`Input.dispatchKeyEvent` /
  `Input.dispatchMouseEvent`):
  - keyboard: `keydown` / `keyup` / `keypress` / `press` / `type`, carrying
    `key`, `code` (e.g. `KeyA`), and modifiers (Alt/Ctrl/Meta/Shift);
  - mouse: `click` at x/y (mousedown+mouseup+click), `hover`/`move` at x/y
    or on a selector, `down`/`up`, `doubleClick`;
  - scroll: `mouseWheel` with `deltaX`/`deltaY` (actually scrolls the page;
    `window.scrollY` changes).
- **Real PNG screenshot** from `Page.captureScreenshot`, with proof metadata
  (`backend: "chrome-headless-cdp"`), console entries, and page exceptions.

## What native Merkava CANNOT do (static render only)

Merkava's native software renderer (`merkava`, `merkava-image` modes) is a
**static DOM + pixel pipeline with no JS engine**. It never executes page
`<script>`s, has no layout engine for hit-testing, and cannot synthesize real
input events. Interactions that require a real browser **fail loudly** on the
virtual path as `chrome-only interaction: ...` — they are never silently
faked:

- coordinate clicks/hover (`click`/`hover` with x/y),
- `keydown`/`keyup`/`keypress` with `key`+`code`, or any keyboard action with
  explicit `code`/`modifiers`,
- `scroll` / `mouse.scroll` (wheel).

Selector-based `click`/`type`/`press` keep working on the virtual path through
the synthetic DOM (they dispatch synthetic DOM events, not real input).

## Chrome absent → honest fallback

If `mode=chrome-if-available` is requested but no Chrome binary is found,
`runRenderMode` falls back to Merkava's static renderer with
`fallbackReason: "chrome_not_found"` on the screenshot metadata and a
suggestion to install Chrome. The mode result never claims a Chrome backend
it did not use.

## Tests

- `render-lab/renderLabChrome.test.mjs` — T1..T4 through `runRenderLab`
  (the exact tunnel-path call): JS evaluation, coordinate click counter,
  keydown key/code capture, hover state + wheel scroll. Requires Chrome.
- `render-lab/renderLabVirtualHonesty.test.mjs` — the virtual path refuses
  chrome-only interactions loudly; selector clicks still work.
- `render-lab/testRenderLab.mjs` — legacy smoke test for the static modes.

Run: `node --test render-lab/renderLabChrome.test.mjs`
