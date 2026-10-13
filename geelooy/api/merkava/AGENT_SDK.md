# B"H — Merkava Agent SDK

Run any page's JavaScript through the real Merkava browser engine and get
every runtime error instantly. No browser, no repo needed.

## One-command install

```bash
curl -fsSL https://awtsmoos.com/api/merkava/download/install.sh | bash
# installs `merkava` to ~/.local/bin (override with MERKAVA_DEST)
```

## CLI

```bash
# FLAGSHIP: run a page's JS, print every runtime error with file:line
merkava run-js https://example.com/page

# Raw JS snippet
merkava run-js --js 'console.log("hi"); badFn();'

# HTML string or file
merkava run-js --html '<html><body><script>oops();</script></body></html>'
merkava run-js --file page.html

# Screenshot (JS executes first, so JS apps render)
merkava --url https://example.com --out shot.png --device iphone14
merkava devices   # list viewport presets
```

Exit code is 1 when JS errors are found, 0 when clean.

## Live API (no install)

```bash
# run-js: POST {url|html|js} -> {console_logs, js_errors[]}
curl -s -X POST https://awtsmoos.com/api/merkava/run-js \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com/page"}'

# run: POST {url|html, viewport|device, actions} -> {screenshot_png (base64), js_errors, ...}
curl -s -X POST https://awtsmoos.com/api/merkava/run \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com","viewport":"390x844"}'
```

`js_errors[]` entries: `{kind, name, message, file, line, stack}`.

## Node SDK (local, no install beyond the bundle)

```js
import { runPage, runPageWithJs } from './merkava.mjs';

// Full page: screenshot + JS errors + console
const r = await runPage({ url: 'https://example.com', device: 'iphone14' });
console.log(r.jsErrors);          // [{name, message, file, line, stack}]
require('fs').writeFileSync('shot.png', r.png);

// JS only: errors + console + post-JS DOM
const j = await runPageWithJs({ url: 'https://example.com', waitMs: 4000 });
console.log(j.jsErrors);
console.log(j.finalHtml.slice(0, 200));
```

## Python SDK

```python
import json, subprocess, base64

def merkava_run_js(url):
    out = subprocess.run(
        ['merkava', 'run-js', url],
        capture_output=True, text=True)
    return {'exit_code': out.returncode, 'output': out.stdout}

def merkava_api_run_js(url):
    import urllib.request
    req = urllib.request.Request(
        'https://awtsmoos.com/api/merkava/run-js',
        data=json.dumps({'url': url}).encode(),
        headers={'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req, timeout=90))

# copy-paste:
print(merkava_run_js('https://example.com/page'))
```

## Notes

- Pages execute in Merkava's synthetic browser: virtual DOM, real fetch,
  timers, console capture. External `<script src>` files are fetched
  automatically (same-origin and absolute URLs).
- ES module scripts (`type="module"`) execute; bare import specifiers
  resolve against the page origin.
- Hebrew and other non-Latin scripts render as `?` in the bitmap painter
  (font limitation) — DOM text is unaffected; check `finalHtml`.
- Rate limit: 20 req/min per IP on the live API.
