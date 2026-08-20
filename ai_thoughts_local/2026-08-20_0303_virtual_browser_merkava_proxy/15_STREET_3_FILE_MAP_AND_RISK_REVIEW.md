B"H
Boruch Hashem
Blessed is He

# Street 3 — Phase 2 File Map and Risk Review

> The Awtsmoos reveals that execution should enter the same window already holding the page, not a parallel phantom. Awtsmoos.com will give the collected graph one living Merkava vessel, let classic scripts speak through virtual globals, and keep every unproven module/navigation road visibly closed.

## Preferred Street 3 module graph

```text
Street 2 graph + Street 1 fetch transport
	↓
classicPageRuntime.js (OS host coordinator)
	↓
NestedBrowserRuntime
	↓
PersistentBrowserRuntime
	├── SyntheticBrowserRuntime
	│   └── SAME VirtualWindow
	│       ├── VirtualHtmlHydrator
	│       ├── collected CSS
	│       ├── VirtualClassicScript executor
	│       └── lifecycle events
	└── frame() -> { snapshot.commands }
		↓
existing paintMerkavaFrame()
```

No server browser process exists in this flow.

## New production files

### 1. `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualClassicScript.js`

UMD browser/Node module.

Responsibilities:
- accept one `SyntheticBrowserRuntime` and classic source string,
- compile source with the existing project semantic pattern: `AsyncFunction` + `with(globals)`,
- lower top-level classic declarations into virtual globals similarly to existing RuntimeAssembler behavior,
- call `synthetic.executeFunction()` so timeout/error/microtask capture remains centralized,
- never call host network directly,
- expose no navigation/module behavior.

Likely exports:
- `executeVirtualClassicScript(runtime, source)`
- pure `lowerVirtualClassicScript(source)` for focused tests.

### 2. `geelooy/os/programs/awtsmoos-browser/classicPageDocument.js`

Responsibilities:
- hydrate graph entry into the existing persistent window using `Merkava.VirtualHtmlHydrator`,
- apply collected external styles from live `<link rel="stylesheet">` nodes,
- enumerate live script elements in document order,
- ignore scripts inside inert `<template>` ancestry,
- classify classic/module/importmap/data script types,
- map external rewritten `src` directly to `graph.files[src]`,
- return a pure execution plan and warnings.

No source compilation in this OS host module.

### 3. `geelooy/os/programs/awtsmoos-browser/classicPageLifecycle.js`

Responsibilities:
- dispatch `DOMContentLoaded` to the virtual document,
- set readyState to interactive,
- dispatch `load` to the virtual window,
- set readyState to complete,
- run lifecycle through `synthetic.executeFunction()` or equally bounded virtual calls so page-handler errors become runtime errors rather than host crashes.

### 4. `geelooy/os/programs/awtsmoos-browser/classicPageRuntime.js`

Responsibilities:
- accept `{ Merkava, graph, pageUrl, fetchTransport, viewport }`,
- create exactly one `NestedBrowserRuntime`, passing `files`, `url`, and `fetchTransport`,
- hydrate the same persistent window,
- apply collected CSS,
- execute only classic script steps in order through `Merkava.executeVirtualClassicScript`,
- record module/importmap/data steps as skipped testimony,
- dispatch lifecycle,
- call `nested.frame(viewport)`,
- return a live controller with:
	- `frame(viewport)`
	- `pointer(type,x,y)`
	- `keyboard(type,key)`
	- `snapshot()`
	- `runtime` or a bounded internal handle only if host integration requires it.

This helper remains isolated from current OS navigation in Street 3.

## Existing file likely touched

### `geelooy/os/programs/awtsmoos-browser/merkavaLoader.js`

Only add `VirtualClassicScript` to the already ordered UMD module list and bump build ID.

Do not load RuntimeAssembler, VirtualNodeRuntime, ModuleExecutor, or dynamic module infrastructure into the OS browser for this street.

## Existing files explicitly not touched

- `runtime.js` — Street 3 proof stays isolated until tested.
- `remoteNavigationController.js`
- `browserNavigationCoordinator.js`
- `index.js`
- `RuntimeAssembler.js`
- `SyntheticBrowserRuntime.js`
- `PersistentBrowserRuntime.js`
- `NestedBrowserRuntime.js`
- Street 1 proxy/security code
- Street 2 collector code
- all Chromium interactive files/routes

## Why document inspection is preferred over another HTML parser

`VirtualHtmlHydrator` already produces the live virtual document. Street 3 can query that document for script/link nodes rather than regex-parsing HTML a third time.

Benefits:
- comments are already discarded by hydration,
- script/style raw text remains attached to the correct element,
- document order comes from the virtual DOM,
- template ancestry can be explicitly checked,
- external rewritten `src`/`href` values are already local synthetic file keys,
- no new source-span rewriting is needed after Street 2.

## 35 risk controls / improvements

1. Create only one nested/persistent/synthetic runtime per live page proof.
2. Execute scripts against `nested.runtime.synthetic`, never a second runtime.
3. Pass Street 1 `fetchTransport` at runtime construction time.
4. Do not replace virtual `fetch` after construction with host fetch.
5. Hydrate the Street 2 rewritten entry, not original remote HTML.
6. Apply only stylesheet bodies already present in graph files.
7. Never network-fetch missing stylesheet/script content during execution.
8. Missing collected file becomes an explicit warning, not ambient network fallback.
9. Preserve script document order from virtual DOM traversal.
10. Ignore script nodes with an inert template ancestor.
11. Execute only classic MIME/type values in Street 3.
12. Skip module scripts explicitly with `CLASSIC_PAGE_MODULE_DEFERRED` testimony.
13. Skip import maps as data; Street 2 already consumed them for graph collection.
14. Skip JSON/data/template script types.
15. Do not treat unknown script type as classic.
16. Do not execute inline event-handler attributes in Street 3 unless the virtual DOM already does so independently.
17. Compile arbitrary guest source only inside the Merkava runtime module, not the OS program module.
18. Use `synthetic.executeFunction()` for centralized timeout and error capture.
19. Preserve the existing virtual-global proxy; never pass real host `window`/`document` into guest code.
20. Preserve top-level classic global behavior by lowering declarations similarly to RuntimeAssembler.
21. Test cross-script global visibility: first script defines, second reads.
22. Test named-element visibility through the synthetic globals proxy.
23. Test a thrown classic script becomes a bounded runtime error.
24. Decide and test whether later classic scripts stop after an earlier failure; prefer current RuntimeAssembler stop-on-failure semantics for parity in this street.
25. Dispatch DOMContentLoaded/load only after classic plan processing finishes.
26. Capture lifecycle-handler errors through the synthetic runtime error channel.
27. Render only after lifecycle completion for deterministic first-frame proof.
28. Subsequent `frame()` calls must use the same persistent runtime/window state.
29. Input routing methods must delegate to the existing persistent event router, not synthesize DOM events in host code.
30. The host controller must never serialize remote cookie values into metrics/snapshot testimony.
31. Test guest `fetch()` with an injected fake routed transport and assert no ambient host fetch occurs.
32. Do not use `RuntimeAssembler` dynamic import path because it currently performs raw host fetch.
33. Do not execute module scripts until browser-safe VM execution is independently proven.
34. Keep all new production files <=120 lines by splitting document/lifecycle/executor/controller responsibilities.
35. Run authority scans for Chromium/CDP/raw `fetch(`/real host `window`/`document` escape patterns after implementation.
36. Re-run Street 1 and Street 2 focused suites after Street 3 proof.
37. Preserve existing local demo `runtime.js` until a later integration street deliberately chooses the new live controller.
38. Keep the current full-document-before-script limitation explicit; do not claim parser-streaming fidelity.
39. Do not remove Chromium-era code merely because the classic proof passes.
40. Do not change server routes in this street.

## Focused tests

### `virtual-classic-script.test.cjs`
Prove:
- top-level `var`/`let`/`const`/class/function visibility across classic script calls,
- virtual DOM mutation,
- errors bounded through SyntheticBrowserRuntime,
- no module behavior.

### `awtsmoosBrowserClassicPageDocument.test.mjs`
Prove:
- graph entry hydration,
- external stylesheet application from graph files,
- inline/external classic plan order,
- template-contained scripts skipped,
- module/importmap/data types classified but not executable,
- missing external file warning.

### `awtsmoosBrowserClassicPageRuntime.test.mjs`
Prove end-to-end in-memory:
- one persistent runtime/window,
- classic scripts mutate hydrated DOM,
- cross-script globals work,
- guest fetch invokes injected fake transport,
- module script does not execute,
- DOMContentLoaded/load handlers execute,
- first frame contains retained paint commands,
- later frame observes same mutated state,
- no Chromium process/network/public Internet required.

## Phase 2 decision

Street 3 should build an isolated **classic live-page controller** over the already existing persistent Merkava runtime. It should not modify current OS navigation yet.

Once this proof is green, the next street can decide how `remoteNavigationController` hands a fetched/collected graph into this live controller. Static modules remain a separately gated capability.
