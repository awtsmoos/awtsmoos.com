B"H
Boruch Hashem
Blessed is He

# Phase 2 — File Map and Dependency Flow

> The Awtsmoos reveals the browser as a chain of vessels: host browser engine, Merkava world, routed fetch, guarded server, public network. Awtsmoos.com should strengthen each seam without smuggling a second browser behind the curtain.

## Runtime flow

```text
Geelooy OS window
	↓
Awtsmoos Browser host controller
	↓
Merkava RuntimeAssembler / Persistent browser runtime
	├── DOM + events + storage + history + timers
	├── classic script execution in host JS engine against virtual globals
	├── VM module execution against virtual globals
	└── VirtualFetch
		↓ unresolved remote request
Browser proxy transport adapter
		↓ same-origin authenticated POST
/api/social/drive/:aliasId/browser/fetch
		↓
ProxyService + SSRF policy + rate limits + cookie jar
		↓
public remote origin
```

## First implementation street — routed VirtualFetch

### Existing files to rewrite completely

1. `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetch.js`
	- Preserve data URL and supplied-file lookup first.
	- Add optional `transport` callback only for unresolved URL requests.
	- Normalize a Fetch-like input/init vessel into URL, method, headers, and body.
	- Keep default offline behavior unchanged when no transport exists.
	- Record network testimony without recording credential/cookie secrets.

2. `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindowCore.js`
	- Pass `options.fetchTransport` / `options.networkTransport` into `VirtualFetch`.
	- Do not expose host `fetch` automatically.
	- Keep deterministic/offline default intact.

3. `geelooy/os/programs/awtsmoos-browser/proxyClient.js`
	- Extend `fetchRemotePage()` to send `body` or `bodyBase64` for POST requests.
	- Preserve same-origin credentials and jar-only cookie identity.
	- Never accept or expose `Cookie` / `Set-Cookie` values.

### New small files

4. `geelooy/os/programs/awtsmoos-browser/merkavaProxyTransport.js`
	- Convert Merkava Fetch-like request input into `fetchRemotePage()` arguments.
	- Resolve relative guest URLs against the current virtual page URL.
	- Carry initiator URL and jar/project/alias host context.
	- Convert proxy response testimony into the shape `VirtualFetch` expects.

5. Focused tests beside the existing browser/runtime tests.
	- Offline default remains a virtual miss.
	- Supplied files still win over network transport.
	- Routed GET succeeds through injected transport.
	- Routed POST forwards string/binary body safely.
	- Response headers/status/final URL are preserved.
	- Transport errors stay bounded and observable.

## Second implementation street — live document resource graph

Do not begin until Street 1 passes.

### New browser-side resource collector modules

- `remoteResourceCollector.js`
	- Start from fetched top-level HTML and final URL.
	- Discover external scripts/styles/import maps using existing Merkava assemblers where possible.
	- Fetch textual dependencies through the same routed transport.
	- Apply explicit file-count/byte/depth limits.

- `remoteResourceAddress.js`
	- Canonical URL ↔ Merkava file-key conversion.
	- No ambient host-origin resolution.

- `remoteModuleCollector.js`
	- Recursively collect static ES-module imports.
	- Respect import maps.
	- Route every remote module fetch through the server proxy.

### Existing files likely rewritten

- `remoteNavigationController.js`
	- Navigation fetches a complete bounded page graph rather than only markup.
	- Hands graph + final URL to the live Merkava controller.

- `runtime.js`
	- Replace `javascript: merkava-bytecode-not-yet-connected` with a real live-page runtime entry.
	- Construct Merkava with proxy transport and collected files.
	- Preserve local editor/self-host behavior as a separate local-document mode.

## Third implementation street — browser-safe VM modules

Do not begin until resource collection is proven with classic scripts.

### Existing problem

`RuntimeAssembler` can run classic scripts in browser mode, but static modules require `executeVmFiles`. The only implementation is CommonJS/Node-shaped `MerkavaVmFileExecutor.js`; browser `ModuleExecutor` is intentionally disabled.

### Preferred correction

Build a browser-safe module executor from the same semantics in small focused modules instead of making the large CommonJS file dual-purpose.

Potential modules:
- `merkava-browser-module/ModulePath.js`
- `merkava-browser-module/ModuleImports.js`
- `merkava-browser-module/ModuleTransform.js`
- `merkava-browser-module/ModuleExecution.js`
- `merkava-browser-module/BrowserVmFileExecutor.js`

Each module remains below the project line ceiling and registers into `globalThis.Merkava` through the existing UMD/browser pattern.

### Existing files later rewritten

- `merkavaLoader.js`
	- Load the browser-safe VM module executor before `RuntimeAssembler`.

- `RuntimeAssembler.js`
	- Replace raw host `fetch()` in dynamic-module collection with an injected routed transport.
	- Keep Node execution compatible.

## Fourth implementation street — navigation and popup intent

Do not begin until live scripts/modules run.

### Existing files likely rewritten

- `VirtualWindowCore.js` / a new small navigation bridge module
	- Install explicit host callbacks for top-level navigation intent.
	- Install `window.open()` as a virtual intent emitter, not host authority.

- `browserNavigationCoordinator.js`
	- Remove `interactiveController` preference.
	- Make local live Merkava navigation the primary path.
	- Keep safe proxy transport and history controls.

- new `merkavaPopupBridge.js`
	- `window.open(url, name, features)` creates another Geelooy `awtsmoosBrowser` window.
	- Child receives alias/jar/project and target URL only.
	- Same jar shares server cookie state; each OS window owns its own Merkava runtime.

## Chromium unwind — only after replacement proof

### Client files to unreference first

- `interactiveClient.js`
- `interactiveSurface.js`
- `interactiveInput.js`
- `interactivePointerFlow.js`
- `interactivePopupBridge.js`
- `interactivePoller.js`
- `interactiveViewSync.js`
- `interactiveState.js`
- `interactiveController.js`

### Server files to unreference later

All `interactive*` Chromium/session/CDP/profile/launcher/loopback-proxy files under `geelooy/api/social/helper/drive/browser/` and `interactiveBrowserRoutes.js`.

### Route rule

`browserRoutes.js` must retain the hardened `/fetch` and `/jars` proxy endpoints. Interactive Chromium session routes should be removed only after no client references remain and the corrected live Merkava tests pass.

## Files explicitly not to rewrite casually

- Existing proxy SSRF/public-address/transport/cookie-policy modules that already pass tests.
- Node DOM runtime unless parity tests reveal a shared abstraction belongs there.
- Large VM executor merely to make it browser-compatible; prefer small browser-specific modules sharing semantics through tests.

## Validation gates per street

1. Syntax / line-count checks on only touched files.
2. Focused unit tests for that seam.
3. Existing Merkava browser/runtime regression tests.
4. Existing Drive proxy regression tests.
5. Only after the local seam passes: one integrated browser test.
6. No Chromium process should be required by any corrected-path integration test.
