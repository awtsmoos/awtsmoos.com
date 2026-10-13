# Merkava — run page JS, get every error. No browser.

B"H

**Flagship:** execute JavaScript with Merkava's real VM and instantly get back
every runtime error — console output, uncaught exceptions with file/line,
failed loads. No browser, no repo needed.

```bash
# One command, prints errors:
merkava-shot run-js https://awtsmoos.com/some/page
# ERROR [runtime] ReferenceError: foo is not defined @ <inline>:3

# Or raw JS:
merkava-shot run-js --js 'console.log("hi"); brokenFn();'
# [log] hi
# ERROR [runtime] ReferenceError: brokenFn is not defined @ <inline>:1
```

Three distribution paths, one shared core (`runPage` + `runJs`):

| Path | How | Best for |
|---|---|---|
| **Standalone CLI** | `curl -fsSL https://awtsmoos.com/api/tunnel/install/merkava-shot.sh \| bash` | Humans, shell scripts, agents |
| **Live API** | `POST https://awtsmoos.com/api/merkava/run-js` | Agents with nothing installed |
| **Tunnel-local** | `POST http://127.0.0.1:<port>/merkava/run-js` on an installed tunnel | Agents on a tunnel (no network round-trip) |

## Install (one line)

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/merkava-shot.sh | bash
# then:
merkava-shot run-js <url>              # JS errors
merkava-shot --url <url> --out shot.png  # screenshot (JS now executes!)
```

Direct files:
- Tarball: https://awtsmoos.com/api/tunnel/install/runtime/merkava-shot.tar.gz (+ `.sha256`)
- Installer: https://awtsmoos.com/api/tunnel/install/merkava-shot.sh

## run-js — the flagship (documented first)

### CLI

```bash
merkava-shot run-js <url>
merkava-shot run-js --js 'throw new Error("boom")'      # ERROR [runtime] Error: boom
merkava-shot run-js --js-file app.js
merkava-shot run-js --html '<script>badFn()</script>'
merkava-shot run-js page.html                            # --file also accepted
```

Output: `[level] message` lines for console, then `ERROR [kind] Name: message
@ file:line` per error. Exit 1 if any errors. Kinds: `runtime`, `parse`
(real file/line from the parser), `timeout`, `skipped` (ES modules — the VM
doesn't compile import/export yet).

### Live API — POST /api/merkava/run-js

```bash
curl -s https://awtsmoos.com/api/merkava/run-js -X POST \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://awtsmoos.com","timeoutMs":15000}' | python3 -m json.tool
```

Body: `{js|html|url, file?, maxSteps?, timeoutMs?}`. Response:

```json
{
  "ok": false,
  "status": "ERRORS",
  "console_logs": [{"level": "log", "text": "hi"}],
  "js_errors": [{
    "kind": "runtime", "name": "ReferenceError",
    "message": "foo is not defined",
    "file": "<inline>", "line": 3, "estimated": true,
    "ip": 42, "stack": "..."
  }],
  "scripts_run": 2, "steps": 1204,
  "timings_ms": {"total": 312},
  "version": "1.0.0"
}
```

`line` is exact for parse errors; for runtime errors it's best-effort
(`estimated: true`) — the bytecode has no line table, so the engine matches
the offending identifier/message against the source.

### Tunnel-local — POST /merkava/run-js

Same body/response shape as the live API, runs on the installed tunnel.

### Screenshots now execute page JS

`POST /api/merkava/run` (and `runPage`) executes inline `<script>`s through
the VM before layout. Response now includes real `console_logs`, `js_errors`,
and `js_status`. Pass `executeJs: false` to skip.

## For AI agents

### Option A — live API (zero install)

```bash
# run-js:
curl -s https://awtsmoos.com/api/merkava/run-js -X POST \
  -H 'Content-Type: application/json' \
  -d '{"js":"console.log(1+1); nope();"}'
# screenshot:
curl -s https://awtsmoos.com/api/merkava/run -X POST \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://awtsmoos.com","device":"iphone14"}' \
  | python3 -c "import json,sys,base64; j=json.load(sys.stdin); open('shot.png','wb').write(base64.b64decode(j['screenshot_png'])); print(j['js_errors'])"
```

### Option B — Python SDK (one command)

```python
from merkava_sdk import run_js, screenshot

r = run_js(url="https://awtsmoos.com")
print(r["jsErrors"])     # [{'kind':..., 'name':..., 'message':..., 'file':..., 'line':...}]
print(r["consoleLogs"])

r = screenshot("https://awtsmoos.com", device="iphone14")
open("shot.png", "wb").write(r["png"])
```

### Option C — Node SDK

```js
import { runJs, screenshot } from './merkava-sdk.mjs'; // ships in the tarball
const r = await runJs({ js: 'brokenFn();' });
console.log(r.jsErrors);   // [{kind:'runtime', name:'ReferenceError', ...}]
const { png } = await screenshot('https://awtsmoos.com', { device: 'iphone14' });
```

SDK resolution order: local bundle → live API → `merkava-shot` on PATH.
Override the API base with `MERKAVA_API`; override the CLI with `MERKAVA_SHOT_BIN`.

## API reference (live + tunnel-local, same shape)

`POST /run-js` — body: `{js|html|url, file?, maxSteps?, timeoutMs?}` → run-js
response above (flagship).

`POST /run` — body: `{html|url, css, js, viewport|device, actions, timeoutMs,
executeJs?}` → screenshot + `console_logs`, `js_errors`, `js_status`.

`GET /devices` — viewport presets.

## CLI usage

```bash
merkava-shot run-js <url|--js code|--js-file f.js|--html ...>  # flagship
merkava-shot --url <url> --out shot.png [--device iphone14] [--fast]
merkava-shot --file page.html --device iphone14 \
  --interact "shot:before.png;click:.close-x;assert:hidden:.sheet"
merkava-shot --batch batch.json
merkava-shot --serve          # persistent NDJSON on stdin
merkava-shot --devices        # list viewport presets
```

Interaction ops: `shot[:path]` `click:x,y|click:.sel` `tap:` `hover:` `dblclick:`
`scroll:dy` `scrollto:y` `type:.sel:text` `press:Enter` `wait:ms`
`state:.sel:+open|-open|~open` `hide:.sel` `show:.sel` `attr:` `style:`
`assert:visible:` `assert:hidden:` `assert:text:` `assert:bg:` `viewport:WxH` `log:`

## Notes

- The VM executes real JavaScript (parser → bytecode → VM). ES module
  scripts (`type="module"` / import/export) are reported as `skipped` — not
  yet supported.
- External `<script src>` files are not fetched by run-js (inline only).
- Hebrew text renders as `?` in the bitmap painter (no font shaping yet).
- Version 1.1.0 — bundled from mw-repo @ 2026-10-13.
