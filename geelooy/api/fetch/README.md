# B"H — Guarded Fetch Proxy (geelooy/api/fetch/)

Lets remote bytes pass through a guarded server vessel instead of an unbounded
proxy: authenticated, origin-checked, size- and rate-limited remote fetching for
text or binary data.

## Contents
- `_awtsmoos.derech.js` — whole API: route `/`.
- `DOCUMENTATION.md` — auth, origin, limits, binary handling, caller evidence.

## Endpoint
- `/` — fetch a remote URL server-side. Requires login (401 otherwise) and an
  origin/referer on awtsmoos.com (403 otherwise). Limits: 30 requests/min and
  50 MB/min per user.

## Guards
Origin allow-listing plus per-user request and byte budgets keep the proxy
deliberate; see `DOCUMENTATION.md` for the auth/limits contract.
