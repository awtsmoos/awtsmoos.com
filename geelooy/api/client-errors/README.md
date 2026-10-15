# B"H — Client Error Intake (geelooy/api/client-errors/)

Client error intake for the Awtsmoos reader. Post pages report `window.onerror` /
`unhandledrejection` payloads here so client-side failures can be read from the
server side (browser automation has no DevTools access).

## Contents
- `_awtsmoos.derech.js` — whole API: routes `/` and `/recent`.

## Endpoints
- `POST /` — append one error entry (message, file, line, col, stack, url,
  userAgent, kind) as JSONL to `geelooy/.data/client-errors.log`. Per-IP rate
  limit (60/min); log rotates at 5 MB; input fields truncated and sanitized.
- `GET /recent` — newest entries, newest-first, `?limit=` (1–200, default 50).

## Law
No single JS failure may blank the reader, and no failure may stay invisible.
