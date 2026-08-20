B"H
Boruch Hashem
Blessed is He

# Street 1 — Completion Evidence

> The Awtsmoos closes this street without pretending the whole city is finished. Awtsmoos.com now has a proven routed-fetch bridge whose browser is Merkava, whose executor is the user's own JavaScript engine, and whose server is only the guarded network/cookie boundary.

## Boundary held

- Workspace root remained `/Users/awtsmoos/work` throughout.
- Repo cwd remained `/Users/awtsmoos/work/awtsmoos.com` for command work.
- Virtual OS fallback was never accepted.
- No corrected Street 1 production file starts or depends on Chromium.
- No navigation, resource-graph, static-module, popup, or Chromium-unwind work was mixed into Street 1.

## Corrected architecture proven by source

Street 1 builds on existing project vessels rather than a new backend browser:

- Merkava virtual DOM/browser runtime executes in the user's browser.
- `VirtualWindowCore` owns virtual browser globals.
- `VirtualFetch` now accepts one explicit host transport while preserving offline default behavior.
- `merkavaProxyTransport.js` maps guest fetch intent to the existing same-origin Drive proxy client.
- Drive proxy remains responsible for outbound HTTP, SSRF/public-address policy, redirects, rate/byte ceilings, and cookie jars.
- Remote cookie values remain server-side.

## Final production files for Street 1

Modified:
- `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualBytes.js`
- `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetchHelpers.js`
- `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetch.js`
- `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindowCore.js`
- `geelooy/os/programs/awtsmoos-browser/proxyClient.js`
- `geelooy/os/programs/awtsmoos-browser/merkavaLoader.js`

Created:
- `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetchTransport.js`
- `geelooy/os/programs/awtsmoos-browser/merkavaProxyTransport.js`

Tests created/rewritten:
- `geelooy/scripts/awtsmoos/MerkavaExecutor/tests/virtual-fetch-transport.test.cjs`
- `geelooy/os/test/awtsmoosBrowserProxyClient.test.mjs`
- `geelooy/os/test/awtsmoosBrowserMerkavaProxyTransport.test.mjs`

## Syntax evidence

Each Street 1 production source file was syntax-checked individually with the native Node checker.

Passed:
- `VirtualBytes.js`
- `VirtualFetchHelpers.js`
- `VirtualFetchTransport.js`
- `VirtualFetch.js`
- `VirtualWindowCore.js`
- `proxyClient.js`
- `merkavaProxyTransport.js`
- `merkavaLoader.js`

Result: **8/8 production syntax checks passed**.

## Source-size evidence

Fresh post-write source reads established the production ceiling is respected.

Known exact counts from direct source/audit evidence:
- `VirtualBytes.js`: 83 lines
- `VirtualFetchHelpers.js`: 120 lines
- `VirtualFetchTransport.js`: 72 lines
- `VirtualFetch.js`: 108 lines
- `VirtualWindowCore.js`: 100 lines
- `merkavaLoader.js`: 64 lines

Fresh direct reads also confirmed `proxyClient.js` and `merkavaProxyTransport.js` remain below 120 lines.

Result: **all Street 1 production files <=120 lines**.

## Focused behavior evidence

### Routed VirtualFetch

Result: **5/5 checks passed**.

Covered:
- offline virtual miss remains 404 without transport
- local files take precedence over transport
- `data:` stays local
- relative URL resolves against virtual page base URL
- POST method/body/headers reach injected transport
- final response URL/status/headers/text preserved
- binary `bodyBase64` remains exact bytes
- proxy/security transport errors propagate and are recorded

### Browser proxy client

Result: **4/4 tests passed**.

Covered:
- alias requirement
- unchanged GET payload
- same-origin credentials
- text request body
- base64 request body
- caller Cookie/Set-Cookie stripping
- jar list/clear routes
- 429 + Retry-After testimony

### Merkava proxy transport adapter

Result: **3/3 tests passed**.

Covered:
- guest-relative URL resolution
- host-owned alias/jar/project/initiator context
- URLSearchParams body
- Headers normalization
- caller-cookie removal through proxy client
- binary body base64
- invalid page URL rejection

Focused Street 1 total: **12/12 passed**.

## Existing runtime compatibility evidence

`merkava-runtime-advanced.test.cjs` passed with:
- source compile/run
- VM node-file runtime
- parameterized simulation and interactions

No Street 1 regression was observed in those existing runtime paths.

## Existing backend compatibility evidence

An initial `proxy*.test.js` glob discovered zero tests. That result was explicitly rejected as evidence.

Actual test filenames were then discovered and six non-Chromium suites were run directly:
- `browserRoutes.test.js`
- `headersCookies.test.js`
- `rateLimiter.test.js`
- `service.test.js`
- `transport.test.js`
- `urlAddressPolicy.test.js`

Result: **19/19 passed, 0 failed**.

The passing backend evidence includes:
- route authority
- caller cookie stripping
- response Set-Cookie stripping
- isolated server jars without exposed values
- SameSite/Secure behavior
- Domain widening refusal
- user rate isolation
- request/response byte budgets
- concurrency budgets
- redirect revalidation
- server cookie storage
- cross-origin Authorization stripping
- unsupported method refusal
- pinned peer transport
- response ceiling enforcement
- URL/private-address/mixed-DNS/public-DNS policy

## Chromium-dependency scan

The corrected Street 1 production files were scanned for:
- Chromium
- Chrome launcher
- remote-debugging
- `webSocketDebuggerUrl`
- CDP

Result: **`STREET1_CHROMIUM_SCAN=PASS`**.

This does not claim the old Chromium subsystem is gone. It proves the newly corrected network seam does not depend on it.

## Known pre-existing contract mismatch

Existing `merkavaBrowserContract.test.mjs` result: **4/5 passed**.

The single failing contract expects direct `createRemoteNavigationController` wiring in `index.js`. Current pre-Street-1 browser entrypoint instead uses the Chromium-era `createBrowserNavigationCoordinator`.

This is intentionally deferred because fixing it belongs to the later live-navigation/Chromium-unwind street. Hiding that mismatch inside Street 1 would violate the one-street constraint.

## Post-write reread evidence

All Street 1 production files were reread from the real native checkout after their final writes. The three Street 1 test files were also reread after writing/execution. The one 121-line helper was corrected and reread at its final 120-line form.

No additional Street 1 defect was found in the final reread.

## Scoped Git-status evidence

A scoped `git status --short` was run only over the Street 1 files and this planning folder.

It reported modified/untracked paths only inside that scope; no unrelated repository path appeared in the result.

Some created Merkava helper/test paths did not appear in the status output. Their Git tracking/ignore state is therefore not inferred here; their existence/content was established separately by direct source reads and successful tests.

## Final Street 1 verdict

**COMPLETE.**

The routed-network seam is now Chrome-free and source/test proven:

```text
Guest code in Merkava
	↓
VirtualFetch
	↓ unresolved HTTP(S) only
host-owned merkavaProxyTransport
	↓
same-origin authenticated Drive proxy
	↓
server SSRF / redirect / limits / cookie jar
	↓
remote origin
```

No backend browser process is required by this seam.

## Stop gate

Do not begin Street 2 under this ledger.

Street 2 must begin with a new reassessment of the current source and should focus only on bounded remote resource graph collection: HTML external scripts/styles/static-module dependencies entering Merkava's file graph through the proven routed transport.

Navigation, popups, browser-safe module execution, and Chromium deletion remain later streets unless fresh source evidence changes the dependency order.
