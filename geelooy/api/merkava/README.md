# B"H — Merkava Page-Run API (geelooy/api/merkava/)

Runs any page's JavaScript through the real Merkava browser engine (virtual DOM +
fetch) and returns genuine runtime results: base64 screenshot, console logs,
JS errors, final DOM state, assertions, and timings.

## Contents
- `_awtsmoos.derech.js` — routes `/`, `/devices`, `/download-bundle`,
  `/download-installer`, `/run-js`, `/run`
- `AGENT_SDK.md` — one-command agent SDK usage (`merkava run-js <url>`)
- `dist/` — `install.sh` + `merkava.mjs` standalone installable bundle

## Endpoints
- `/run` — POST `{html|url, css, js, viewport|device, actions}` → screenshot,
  console logs, errors, DOM state, timings. Rate-limited per IP, bounded input
  sizes and renderer timeout.
- `/run-js` — run a JS snippet/HTML string/file, print every runtime error.
- `/download-bundle` / `/download-installer` — fetch the standalone agent bundle.
- `/devices` — available device/viewport presets.
