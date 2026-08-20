B"H
Boruch Hashem
Blessed is He

# Phase 1 — Source-Grounded Browser Architecture

> The Awtsmoos does not need a second Chrome hidden behind the first. Awtsmoos.com already contains a synthetic browser sky: DOM, events, storage, fetch vessels, scripts, modules, workers, canvas, WebGL, history, and retained rendering. The correction is to connect the existing vessels, not replace them with a remote browser process.

## Non-negotiable architecture

1. **No Chromium-backed backend browser engine.**
	The Drive backend is a network/security boundary only.
2. **The user's own browser executes the live Merkava runtime.**
	Guest JavaScript runs through Merkava inside the same JavaScript engine already executing Geelooy OS.
3. **The server reroutes external HTTP traffic.**
	All remote requests go through the authenticated Drive browser proxy so CORS, SSRF policy, redirects, metering, and cookie custody remain server-owned.
4. **Remote cookies never become client JavaScript values.**
	The client carries only `jarId`; `Set-Cookie` remains consumed by the server jar.
5. **Node DOM remains an existing headless/test/tooling runtime.**
	It is valuable for simulation and parity, but normal interactive OS browsing does not require a Node-rendered page or Chromium.
6. **Popups belong to Geelooy OS.**
	Guest `window.open()` should emit an explicit virtual-window request that the host OS turns into another `awtsmoosBrowser` program window sharing the same server jar.

## Verified existing vessels

### User-browser Merkava runtime
- `geelooy/os/programs/awtsmoos-browser/merkavaLoader.js` already loads the Merkava browser graph into `globalThis.Merkava`.
- `SyntheticBrowserRuntime` exposes virtual browser globals including DOM, `fetch`, storage, history, events, workers, canvas/WebGL, mouse, keyboard, timers, URL APIs, and lifecycle surfaces.
- `PersistentBrowserRuntime` retains a live synthetic window/document across frames and routes pointer/keyboard input locally.
- `NestedBrowserRuntime` wraps persistent runtimes for bounded child contexts.
- `RuntimeAssembler` already executes classic scripts and is intended to execute modules in browser mode.
- `MerkavaRuntimeBridge` explicitly describes itself as a browser/public-root bridge into the Chrome-free Merkava runtime.

### Existing Node DOM runtime
- `geelooy/apps/tunnel/agent/tools/fs/nodeDomRuntime` already provides VM execution, hydration, click/fill/type/evaluate actions, script/module runners, and Playwright/Puppeteer-shaped compatibility over Merkava.
- `merkavaAdapter.js` deliberately reuses `VirtualWindow` rather than inventing another DOM.
- This confirms Node DOM is a parity/testing/headless surface, not a reason to add Chromium.

### Existing server proxy
- `proxyClient.js` already calls same-origin `/api/social/drive/:aliasId/browser/fetch` with authenticated browser credentials and `jarId`.
- `ProxyService` already performs redirects, cross-origin Authorization stripping, URL policy, public-address enforcement, usage accounting, and server-side cookie handling.
- `proxyResponse.js` returns final URL, status, safe headers, body bytes/base64, decoded text where appropriate, redirects, usage, and secret-free jar metadata.
- `proxyRequestPolicy.js` supports GET, HEAD, and POST with bodies up to 1 MiB and browser-like redirect method changes.

## Verified gaps

### Gap A — VirtualFetch is offline-only
`VirtualWindowCore` always constructs `VirtualFetch` from `files`, `baseUrl`, and `graph`. Real-network misses intentionally return a virtual 404.

**Required correction:** allow an optional injected transport for network misses. Default behavior must remain offline so existing deterministic tests do not silently gain host-network authority.

### Gap B — proxyClient does not forward request bodies
The server accepts `body` / `bodyBase64`, but `fetchRemotePage()` currently sends URL, method, headers, jar, project, and initiator only.

**Required correction:** add bounded request-body forwarding from the browser-side transport.

### Gap C — remote top-level navigation renders inert HTML
`remoteNavigationController.js` already fetches the top-level document safely and tracks history, but then calls the local renderer with markup only.

**Required correction:** top-level navigation should build a live Merkava page runtime from the fetched document/resource graph.

### Gap D — referenced resources must enter the file graph
`HTMLAssembler` discovers external classic/module scripts and styles but expects their content to already exist in `files`.

**Required correction:** browser-side resource collection must resolve referenced URLs and fetch them through the same proxy before execution. Static ES-module dependencies must also be collected recursively within explicit limits.

### Gap E — browser static-module executor is not registered
`RuntimeAssembler` calls `executeVmFiles` when available. The only implementation found is `merkava-binary/MerkavaVmFileExecutor.js`, which is CommonJS/Node-shaped and is not registered by the browser bridge. The fallback `ModuleExecutor` intentionally throws.

**Required correction:** expose a small browser-safe Merkava VM module executor built from the existing semantics, split into modules under the project line limit. Do not re-enable native browser `import()` against remote origin code.

### Gap F — dynamic module loading uses host `fetch`
`RuntimeAssembler.collectDynamicModuleEnv()` calls its local `fetchText()`, which currently invokes the host browser's raw `fetch()`.

**Required correction:** inject the same routed transport used by `VirtualFetch`; no guest-origin external request should silently bypass the Drive proxy.

### Gap G — virtual navigation and popup hooks are incomplete
`VirtualWindowHelpers` changes `location` for history state but does not load a new document. `VirtualWindowPlatform` currently installs no `window.open` bridge.

**Required correction:** explicit host callbacks for navigation and popup intent. The host Geelooy browser controller performs the proxy navigation or opens a sibling OS browser window.

## First implementation seam

Do **not** remove Chromium files first. First make the corrected Merkava path independently functional and tested. The first production seam should be network transport injection because it is foundational and backward-compatible:

1. Extend `VirtualFetch` with an optional transport callback for unresolved real URLs.
2. Thread that option through `VirtualWindowCore` / `SyntheticBrowserRuntime` without changing offline defaults.
3. Add a browser-side adapter that maps Fetch-like requests to `proxyClient.fetchRemotePage()` and reconstructs the virtual Response object.
4. Forward POST bodies through `proxyClient` using the backend's existing request policy.
5. Test offline default behavior and routed transport behavior before touching navigation.

## Explicitly deferred until the network seam passes

- Static external resource graph loading.
- Browser-safe VM static-module execution.
- Live page lifecycle/navigation replacement.
- `window.open()` → Geelooy OS browser window bridge.
- Removal/unwiring of the Chromium interactive subsystem.
- Deletion of Chromium-specific server/client files.

This ordering prevents a destructive unwind before the intended replacement is proven.
