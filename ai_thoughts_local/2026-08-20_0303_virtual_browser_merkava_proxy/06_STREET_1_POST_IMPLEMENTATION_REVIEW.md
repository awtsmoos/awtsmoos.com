B"H
Boruch Hashem
Blessed is He

# Street 1 — Post-Implementation Review

> The Awtsmoos revealed that the first bridge never needed a hidden browser kingdom. Awtsmoos.com now has a narrower road: Merkava remains the browser vessel, the user's JavaScript engine remains the executor, and the server guards only the network crossing and its cookie jar.

## Original Street 1 promise

Street 1 was intentionally narrow:

1. Keep `VirtualFetch` offline by default.
2. Allow one explicit injected transport only for unresolved HTTP(S) fetches.
3. Preserve virtual files and `data:` URLs ahead of network transport.
4. Thread the transport through `VirtualWindowCore` without changing navigation.
5. Extend `proxyClient` to carry POST bodies through the existing Drive proxy.
6. Keep cookie authority server-side.
7. Add a browser-host adapter from Merkava request intent to the Drive proxy.
8. Preserve binary response bytes.
9. Do not wire navigation, resource graphs, modules, popups, or Chromium removal yet.
10. Keep every touched production file at or below 120 lines.
11. Prove the seam with focused tests plus existing Merkava and non-Chromium proxy regressions.

## What was actually written

### `VirtualBytes.js`
- Added byte-preserving base64 decode as `decodeBase64Bytes()`.
- Kept existing text decode semantics by delegating through byte normalization.
- Fresh post-write source review found no defect.
- Syntax check passed.
- Production line ceiling satisfied.

### `VirtualFetchHelpers.js`
- Generalized the Response-like garment to retain normalized bytes.
- `arrayBuffer()` now returns exact bytes.
- `blob()` exposes bounded text/arrayBuffer/type testimony.
- Response headers are normalized case-insensitively.
- Existing data-URL/file-candidate logic remains intact.
- First rewrite was 121 lines; a full-file second pass removed one blank separator only.
- Final file is exactly 120 lines.
- Syntax check passed.

### New `VirtualFetchTransport.js`
- Extracted request normalization, route eligibility, outgoing transport shape, and remote-response byte shaping.
- This split reduced `VirtualFetch.js` from an initial 144-line implementation to a small compliant module graph.
- Syntax check passed.

### `VirtualFetch.js`
- Keeps `data:` first.
- Keeps virtual files second.
- Uses injected transport only for unresolved HTTP(S) requests.
- Keeps old virtual 404 when no transport exists.
- Resolves relative URLs from virtual `baseUrl`.
- Records transport testimony without body content.
- Rethrows transport/security failures instead of hiding them as fake HTTP successes.
- Preserves exact `bodyBase64` bytes through the helper path.
- Final file is 108 lines.
- Syntax check passed.

### `VirtualWindowCore.js`
- Only semantic Street 1 change is transport threading:
	`options.fetchTransport || options.networkTransport || null`.
- No popup, navigation, module, or host-network authority was added.
- Final file is 100 lines.
- Syntax check passed.

### `proxyClient.js`
- Existing GET payload remains unchanged when no body is supplied.
- Optional text `body` is forwarded.
- Optional `bodyBase64` is forwarded and wins when both are present.
- Client-controlled `Cookie` and `Set-Cookie` headers are stripped case-insensitively.
- Same-origin authentication, alias validation, jar routes, status/error mapping, and Retry-After handling remain intact.
- Production line ceiling satisfied.
- Syntax check passed.

### New `merkavaProxyTransport.js`
- Resolves guest-relative URLs against the virtual page URL.
- Host owns alias, jar, project, and initiator context.
- Supports string, URLSearchParams, ArrayBuffer/view, and arrayBuffer-bearing request bodies.
- Binary bodies cross as base64.
- Uses only `proxyClient.fetchRemotePage()`; no guest raw third-party fetch is exposed.
- Not wired into OS navigation/runtime yet by design.
- Production line ceiling satisfied.
- Syntax check passed.

### `merkavaLoader.js`
- Added `VirtualFetchTransport` immediately before `VirtualFetch` in browser load order.
- Bumped build ID to prevent a stale browser module graph from mixing old and new fetch dependencies.
- Final file is 64 lines.
- Syntax check passed.

## Tests actually written and run

### Focused Street 1 tests

`virtual-fetch-transport.test.cjs`
- offline default
- local/data precedence
- relative routed POST
- final URL/status/header/text response behavior
- exact binary bytes
- transport/security failure propagation

Result: **5/5 behavior checks passed**.

`awtsmoosBrowserProxyClient.test.mjs`
- existing GET payload contract
- alias requirement
- text body forwarding
- base64 body forwarding
- cookie-header stripping
- jar list/clear routes
- 429 + Retry-After testimony

Result: **4/4 tests passed**.

`awtsmoosBrowserMerkavaProxyTransport.test.mjs`
- guest-relative URL resolution
- host-owned alias/jar/project/initiator context
- URLSearchParams body
- Headers normalization with cookie removal
- binary request body
- invalid page URL rejection

Result: **3/3 tests passed**.

Focused Street 1 total: **12/12 passed**.

### Existing Merkava regression

`merkava-runtime-advanced.test.cjs` passed:
- source compile/run
- VM node-file runtime
- parameterized simulation/interactions

### Existing non-Chromium Drive proxy/security regressions

The first attempted `proxy*.test.js` glob discovered zero tests; that result was explicitly rejected as evidence.

The actual six non-Chromium suites were then identified and run directly:
- `browserRoutes.test.js`
- `headersCookies.test.js`
- `rateLimiter.test.js`
- `service.test.js`
- `transport.test.js`
- `urlAddressPolicy.test.js`

Result: **19/19 tests passed, 0 failures**.

These prove:
- Drive route authority
- caller-cookie stripping
- response `Set-Cookie` stripping
- per-user cookie jars without exposed values
- SameSite/Secure policy
- Domain widening refusal
- rate/byte/concurrency budgets
- redirect revalidation
- cross-origin Authorization stripping
- unsupported-method rejection
- pinned transport
- response byte ceilings
- URL policy
- private/mixed/public DNS policy

## Source boundary scan

Street 1 corrected production files were scanned for:
- Chromium
- Chrome launcher
- remote-debugging
- `webSocketDebuggerUrl`
- CDP

Result: **`STREET1_CHROMIUM_SCAN=PASS`**.

This scan is deliberately scoped to Street 1. Old Chromium-era production files still exist elsewhere and are intentionally deferred until the replacement path is proven end-to-end.

## Existing contract mismatch discovered

`merkavaBrowserContract.test.mjs` produced **4/5 passes**.

The one failure expects `index.js` to directly wire `createRemoteNavigationController`. The current file instead wires the older Chromium-era `createBrowserNavigationCoordinator`.

This mismatch:
- predates Street 1,
- is outside the routed-fetch seam,
- is direct evidence that the later navigation/unwind street is still required,
- must not be hidden by changing navigation during Street 1.

Therefore it is recorded, not patched here.

## Planned versus actual

| Planned Street 1 item | Actual result |
| --- | --- |
| Offline default preserved | Yes |
| Local/data precedence preserved | Yes |
| Optional injected HTTP(S) transport | Yes |
| Transport threaded into virtual window | Yes |
| Proxy POST body forwarding | Yes |
| Server cookie authority preserved | Yes |
| Browser host proxy adapter | Yes |
| Exact binary response bytes | Yes |
| No Chromium dependency in corrected seam | Yes |
| No navigation/resource/module/popup work mixed in | Yes |
| Production files <=120 lines | Yes |
| Focused tests | 12/12 pass |
| Existing Merkava advanced regression | Pass |
| Existing non-Chromium proxy/security regression | 19/19 pass |

## Was a second implementation pass required?

Yes, but only for structural correctness discovered during Street 1 itself:

1. Initial `VirtualFetch.js` was 144 lines.
	- Corrected by extracting `VirtualFetchTransport.js` and fully rewriting `VirtualFetch.js`.
2. `VirtualFetchHelpers.js` landed at 121 lines.
	- Corrected by a full-file rewrite removing one blank separator; final size is exactly 120 lines.
3. The first test-file write was durably accepted but never consumed.
	- Path existence was checked; ENOENT proved no write occurred before the clean full-file retry.
4. A proxy test glob found zero tests.
	- It was rejected as evidence; actual test filenames were discovered and six real non-Chromium suites were run explicitly.

No additional Street 1 production defect was found after the post-write reread and regressions.

## What remains intentionally unimplemented

These are not Street 1 omissions; they are later streets:

- collecting remote scripts/styles/module graphs
- routing RuntimeAssembler dynamic imports
- browser-safe static VM module execution
- live remote document lifecycle
- anchors/forms/location navigation
- `window.open()` to sibling Geelooy browser windows
- removal of Chromium interactive client/server routes and files

## Street 1 decision

**Street 1 is complete. No further Street 1 implementation pass is justified by current evidence.**

The next action must be a separate reassessment before Street 2. Do not silently continue into resource collection under the same street.
