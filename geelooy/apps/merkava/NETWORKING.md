# B"H — Merkava browser networking

How page loads fetch bytes in v1, where the CORS boundary actually is
(stated honestly), the provider interface, and how the tunnel relay plugs
in later for unrestricted fetching (Yaakov's standing directive).

## v1: host `fetch()`

`js/net.js` defines the seam. Page loads go through a `NetProvider`:

```js
fetchDocument(url) -> Promise<{ ok, status, url, finalUrl, contentType, text }>
fetchAsset(url)    -> Promise<{ ok, status, url, finalUrl, contentType, bytes: Uint8Array }>
```

Both methods **reject** (never fake-success) with a `NetError`
`{ code, message, url }`. Codes: `fetch_failed`, `http_error`, `timeout`,
`tunnel_not_configured`, `tunnel_error`.

`FetchNetProvider` is the host `fetch()` (browser or Node 18+). Verified in
`tests/test-extensions-browser.mjs` S8 (8/8):

- `fetchDocument("data:text/html,<h1>hi</h1>")` → ok, status 200, text + contentType.
- `fetchAsset("data:text/plain,hello")` → ok, 5 bytes.
- `fetchDocument("https://invalid.invalid.nope/")` → rejects, `code: "fetch_failed"`.
- `fetchDocument("http://256.256.256.256/")` → rejects with an honest code.

## The CORS boundary (honest)

The web-hosted Merkava page is a normal web page. Its `fetch()` lives
under the **page origin's CORS policy** — the browser enforces it, we don't
bypass it, and we don't claim to.

**What loads:**
- Same-origin URLs (the app's own static files, `about:` pages are internal).
- Cross-origin URLs whose servers send `Access-Control-Allow-Origin`
  (e.g. `https://example.com`, many CDNs/APIs).
- `data:` / `blob:` URLs (extension assets, generated pages).

**What gets blocked, and why:**
- Cross-origin pages **without** CORS headers (most of the web: news
  sites, Wikipedia HTML, etc.). The browser refuses the read; `fetch()`
  rejects with a `TypeError`. We surface it as `NetError{fetch_failed}`
  — we do **not** distinguish "CORS-blocked" from "DNS failed" because
  the browser deliberately hides the difference. The user sees an honest
  error notice, never a hang and never fabricated content.
- `http://` URLs from an `https://` page (mixed content) — blocked by the browser.
- `file://` URLs — not fetchable from an `https://` page.

**What the user sees:** the address bar shows the URL, the viewport shows
a plain error card with the reason (`fetch_failed`, `http_error 403`,
`timeout`). No spinners that never resolve.

`no-cors` mode is intentionally **not** used for documents: it returns
opaque responses whose bodies JavaScript cannot read — useless for a
browser that must parse the HTML.

## The tunnel relay (Yaakov's standing directive — the unrestricted path)

`TunnelRelayNetProvider` implements the same `NetProvider` interface over
the existing `merkava-browser/MerkavaTunnelClient.js` (read 2026-10-09).
Today it is a **stub**: unconfigured it rejects every call with
`code: "tunnel_not_configured"` (verified S8) — a greppable, honest signal,
never a silent fallback to host fetch.

### The tunnel seam (exact contract the tunnel must expose)

`MerkavaTunnelClient` today exposes: `myDevice/discover/ensureRoute`,
`executeAction(action, params)`, `commandRun`, `pollJob`,
`fsList/fsRead/fsWrite/fsMkdir`, `merkava(action, payload)`. **There is no
fetch relay action yet** — this is the piece to build.

Wiring: `tunnel.configure({ client, action })` where:

- `client` — a `MerkavaTunnelClient` with token + route (`await client.ensureRoute()`).
- `action` — the tunnel action name the remote side implements, e.g. `"fetchUrl"`.

The remote side (the user's own machine at the end of the tunnel, which
has no CORS restriction) must implement:

```
request:  { url: string, response: "text" | "bytes", timeoutMs: number }
success:  { ok: true, status: number, finalUrl?: string,
            contentType?: string, text?: string, bytesBase64?: string }
failure:  { ok: false, error: string }
```

Notes:
- `text` for documents (decoded as UTF-8 remotely); `bytesBase64` for
  assets (JSON-safe). `net.js` decodes base64 locally (`atob` in the page,
  `Buffer` in Node).
- Timeouts: the client passes `timeoutMs + 30000` to `executeAction` so
  the pending-envelope polling (`MAX_RETRIES`, `retryAction`) has room.
- Redirects are followed remotely; `finalUrl` is reported so the address
  bar stays truthful.

### Security posture

The relay gives a web page server-side-request capability through the
user's own tunnel. V1 rule: **the stub refuses to run unconfigured**, and
when configured it must sit behind an explicit per-origin/extension user
opt-in (not yet built). Never silently upgrade `FetchNetProvider` to the
relay.

## What this means for page loads today

`Navigator` (sibling worker) uses `FetchNetProvider`: same-origin and
CORS-open pages load fully; the rest show the honest error card until the
tunnel relay action exists. That is the complete, verified v1 story — no
fake claims.
