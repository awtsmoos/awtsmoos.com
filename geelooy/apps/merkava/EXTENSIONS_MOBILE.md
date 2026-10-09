# B"H — Extensions on mobile (Android APK shell)

Why the same extension host runs on Android with no porting of extension
logic, what already holds, and what the APK shell must provide.

## The core claim

`merkava-browser/ExtensionHost.js` + `VmScriptRunner.js` are **pure
JavaScript with zero Node-only dependencies on the browser path**, verified
by `tests/test-extensions-browser.mjs` (61/61 in a `vm` sandbox with no
`require`/`module`/`process`/`Buffer`/`fs`):

- All Node access goes through a guarded `nodeRequire()` shim that returns
  `null` in a page. No bare `require()` outside it (S0 audit).
- `Buffer` is used only by the CRX3/zip reader — the unpacked flow is
  Buffer-free (S0 audit).
- `process.cwd()` is guarded by `path ?` and never evaluated in a page.
- Background service workers run through the **real Merkava VM**
  (MerkavaASTParser → JSON IR → bytecode → Merkava VM). V8/JavaScriptCore
  never executes guest code directly: guest function values cross into the
  host as interpreter vessels bridged by `DefaultMerkavaHost.callMethod`.
- The VM pipeline is injected, not required:
  `VmScriptRunner.setPipelineLoaders({ compileJsToCode, createDefaultHost,
  decodeSangArtifact })` — the page bundle supplies the already-bundled
  modules, so the Node-only `loadPipeline()` never runs.
- `chrome.storage.*` persists via a backend chain: **node fs → browser
  localStorage → in-memory**. On Android the localStorage leg is what
  persists (per-extension key namespace `merkava.ext.<id>.storage.<area>`).

So on Android the extension system is the *same files*, not a port.

## What already holds (verified, not claimed)

| # | Verified in `test-extensions-browser.mjs` |
|---|---|
| S0 | Static audit: zero unguarded Node-only deps on the browser path |
| S1 | Module loads in a browser-like global; manifest V2+V3 validation; match patterns (`*://*.example.com/*`, `<all_urls>`); unpacked load; `startBackground` degrades cleanly without the VM |
| S2 | `chrome.storage.local` persists via localStorage, incl. across a simulated page reload |
| S3 | `chrome.alarms` fires on page timers |
| S4 | Background service worker **COMPLETES in the real Merkava VM** inside the sandbox; VM-registered alarms fire; VM storage writes persist |
| S5 | Content script executes in the VM with an observable DOM effect, routed by match pattern |
| S6 | Popup HTML renders through the real Merkava engine (parse → paint → PNG) and decodes to real pixels (button #3aa757 and heading #123456 found in the pixel buffer) |
| S7 | Real open-source extension end-to-end: `GoogleChrome/chrome-extensions-samples` `tutorial.getting-started` (Apache-2.0) — manifest parses, service worker runs in the VM, `runtime.onInstalled` fires → `chrome.storage.sync.color === "#3aa757"`, popup renders to non-blank pixels |
| S8 | `js/net.js` provider interface (see NETWORKING.md) |

## What the APK shell must provide

The APK is a **WebView-free canvas host**: it does not need Chromium, V8
guest execution, or Node. It needs:

1. **A JS runtime** (JavaScriptCore, Hermes, or V8) running the page bundle:
   `ExtensionHost.js` + `VmScriptRunner.js` + the bundled
   `merkava-binary/*` pipeline modules + the VM sources
   (`merkava-opcodes.js`, `merkava-vm/*` — plain scripts, no `require`).
2. **`window.MerkavaVmPipeline = { compileJsToCode, createDefaultHost,
   decodeSangArtifact }`** and **`globalThis.MerkavaVM`** (load the VM
   sources into the page global before injecting the pipeline).
3. **A `localStorage` implementation** (or any Storage-shaped shim) —
   this is the extension-storage persistence leg on mobile.
4. **File access for unpacked extensions**: a directory picker (Android
   Storage Access Framework) producing file bytes; `loadUnpacked()` takes
   `{ name|webkitRelativePath, arrayBuffer() }`-shaped objects — no DOM
   `File` API required, any native bridge that yields bytes works.
5. **Timers** (`setTimeout`/`clearInterval`) — alarms.
6. **A Buffer polyfill** (or equivalent) for the VM pipeline's SANG
   artifact path. `VmScriptRunner` degrades without it, but artifact
   decode is cleaner with it.
7. **Canvas 2D** (`putImageData`) for popup rendering — the host paints
   popups on canvas from engine pixels; no DOM rendering of popups needed.
8. **PNG decode** only for tests; production never decodes PNG.

## Honest v1 limits (all documented in `js/extensions-host.js`)

- **Unpacked extensions only.** CRX3 parsing needs `Buffer`+`zlib`
  (Node-only today). Extract on a server or via the tunnel, then load unpacked.
- **Extension files are session-only** (in-memory); metadata + `chrome.storage`
  survive restarts via localStorage. A persistent file store (e.g. app-private
  files dir via the native bridge) is the natural next step, not a redesign.
- **Popup scripts don't execute in v1** — popups render as static HTML+CSS
  through the engine to canvas. `popup.js` interactivity (like the
  getting-started color button) is future work.
- **`chrome.tabs.*`** is the host's virtual tab list until the tabs worker
  wires the real `TabManager`.
- **`fetch()` inside extension code** is subject to the page CORS policy
  (see NETWORKING.md); the tunnel relay is the unrestricted path.
- The render pipeline's PNG encoder uses `zlib` — the APK bundle needs a
  zlib/inflate polyfill (e.g. pako) for the *test/screenshot* path only.

## Threat model note

Guest extension code never runs as host JS: it is compiled to Merkava
bytecode and stepped by the VM with a bounded cycle budget
(`cycles: 60000` per background script). The `chrome.*` API is the only
host surface. Content scripts run against a page-provided `document` —
on mobile that is the engine's virtual DOM, not a WebView DOM.
