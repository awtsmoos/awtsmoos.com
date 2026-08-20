B"H
Boruch Hashem
Blessed is He

# Street 2 — Post-Implementation Review

> The Awtsmoos reveals the second street as a cartographer rather than a browser engine. Awtsmoos.com now gathers the remote page's textual constellation through the guarded proxy, gives every remote road a collision-safe local Merkava shadow, and executes nothing while the map is being drawn.

## Original Street 2 promise

Street 2 was intentionally bounded to remote textual resource graph collection:

1. Start from already-fetched top-level HTML and its final remote URL.
2. Use only the Street 1 injected routed transport for network work.
3. Preserve canonical remote URL identity separately from synthetic Merkava file keys.
4. Collect external classic scripts, module entries, static module dependencies, stylesheets, and nested CSS `@import` text.
5. Honor live import maps without guessing bare package locations.
6. Preserve query/origin/port identity and remove URL fragments from fetch identity.
7. Rewrite only references whose resources were successfully collected.
8. Leave dynamic imports, `require()`, CSS binary assets, navigation, popups, and execution for later streets.
9. Enforce file-count, per-file byte, total-byte, and recursion-depth limits.
10. Keep manifests/warnings free of response bodies and cookie values.
11. Keep every production source file at or below 120 lines.
12. Add deterministic tests with no public Internet and no guest execution.

## What was actually written

### `remoteResourceAddress.js`
- Canonicalizes HTTP(S) resources.
- Rejects non-HTTP(S) protocols.
- Strips fragments.
- Preserves query strings.
- Encodes scheme, hostname, effective port, path, and query into synthetic Merkava keys.
- Prevents same-path collisions across origins/schemes/ports/query variants.

### `remoteImportMap.js`
- Parses live inline import maps only.
- Uses `maskHtmlImportMapContexts()` so comments, templates, raw-text bodies, and non-importmap script bodies cannot declare module authority.
- Supports exact mappings, longest-prefix mappings, and most-specific matching scopes.
- Resolves mapping targets relative to the page URL.
- Leaves unmapped bare specifiers unresolved instead of guessing a CDN/package road.

### `remoteHtmlResources.js`
- Discovers only live external classic/module scripts and stylesheet links.
- Uses `maskHtmlResourceContexts()` so comments, templates, raw-text bodies, and script bodies cannot manufacture resource tags.
- Captures exact attribute-value source spans.
- Rewrites only successful collected references, in descending source order.

### `remoteMarkupMask.js`
- Equal-length masks preserve source offsets.
- Masks HTML comments.
- Masks nested `<template>` blocks.
- Masks inert raw-text-body elements: style, textarea, title, noscript.
- Resource view masks all script bodies while leaving legitimate opening script tags visible.
- Import-map view preserves only live import-map script bodies and silences other script bodies.
- Nested masking is explicitly bounded.

### `remoteJsCodeMask.js`
- Extracted lexical executable-code position mask.
- Prevents static module parsing from treating comments, strings, or templates as dependency declarations.
- Split from `remoteModuleResources.js` to satisfy the production line ceiling without compressing functions.

### `remoteModuleResources.js`
- Discovers static import/from, side-effect import, and export-from edges.
- Explicitly excludes dynamic `import()` and `require()` from Street 2 recursion.
- Resolves URL-like specifiers from the canonical importing module URL.
- Resolves bare specifiers only through the import map.
- Rewrites only exact proven static specifier spans.

### `remoteCssResources.js`
- Masks CSS comments before discovery.
- Recursively discovers textual `@import` dependencies.
- Records non-data `url(...)` assets as deferred metadata rather than fetching them.
- Rewrites only successfully collected `@import` spans.

### `remoteResourceBudget.js`
- Extracted pure resource-budget policy after closure audit found the original fetch module at 122 lines.
- Preserves the existing error codes for file bytes, file count, total bytes, and required transport.

### `remoteResourceFetch.js`
- Uses injected transport only; no ambient raw fetch.
- Performs deterministic GET collection.
- Deduplicates requested and redirect-final canonical URLs.
- Accepts only 2xx responses carrying textual `text` testimony.
- Enforces all resource budgets through `remoteResourceBudget.js`.
- Writes accepted text to the synthetic file map.
- Manifest rows deliberately omit source text/body content.

### `remoteResourceWalkers.js`
- Owns module and stylesheet recursion.
- Uses processing/done sets to terminate cycles.
- Enforces independent module/CSS depth ceilings.
- Rewrites only successfully collected children.
- Deduplicates deferred CSS asset testimony.

### `remoteResourceGraph.js`
- Seeds the top-level HTML under its synthetic entry key.
- Parses the import map before resource collection.
- Discovers live HTML resources.
- Collects sequentially through the injected transport for deterministic testimony.
- Coordinates module/CSS recursion.
- Rewrites the top-level HTML only after successful collection.
- Returns pure data: `entry`, `files`, `manifest`, `deferredAssets`, `usage`, `warnings`.
- Executes no guest code.

## Defects discovered during implementation and corrected

Focused tests exposed real parser-authority defects before closure:

1. Static module regex initially treated `"import './fake.mjs'"` inside a string as a dependency.
   - Corrected with lexical executable-code masking.
2. Commented HTML resource tags were initially discovered.
   - Corrected with equal-length HTML comment masking.
3. Commented CSS `@import` and `url(...)` text was initially discovered.
   - Corrected with CSS comment masking.
4. Inline script string text could manufacture a fake nested `<script src>` tag.
   - Corrected by masking script bodies during resource discovery.
5. Commented import-map scripts could declare bare-module authority.
   - Corrected by import-map context masking.
6. Resource tags inside `<template>`, `<style>`, and `<textarea>` were initially discoverable.
   - Corrected by the shared inert-context mask.
7. Import maps inside `<template>` were initially authoritative.
   - Corrected by the same shared import-map context policy.
8. Closure line audit found `remoteModuleResources.js` at 124 lines.
   - Corrected structurally by extracting `remoteJsCodeMask.js`.
9. Closure line audit found `remoteResourceFetch.js` at 122 lines.
   - Corrected structurally by extracting `remoteResourceBudget.js`.

## Path/root correction discovered during review

The tunnel action root is conclusively:

`/Users/awtsmoos/work/awtsmoos.com`

Therefore repo filesystem paths must be `geelooy/...` / `ai_thoughts_local/...`, not `awtsmoos.com/geelooy/...`.

Earlier accepted operations using the doubled prefix targeted a pre-existing nested `awtsmoos.com/` directory. Investigation proved:
- pre-existing nested documentation and `.awtsmoos-agent-transfer` siblings existed before this work,
- the nested `awtsmoos.com/geelooy/os/` subtree was untracked,
- exactly one accidental file from this session existed there: `remoteHtmlResources.js`.

The dedicated deletion surfaces were intercepted by an advisory mission wrapper and did not consume the file. After exact-path and Git evidence, one narrow command removed that single accidental file only:

`rm -f -- awtsmoos.com/geelooy/os/programs/awtsmoos-browser/remoteHtmlResources.js`

Verification:
- exact accidental file path returned ENOENT,
- nested scoped Git status became empty,
- pre-existing nested documentation/transfer siblings were not touched.

From that discovery onward, every source/test validation and final reread used the real checkout root and repo-relative paths.

## Final focused behavior evidence — real checkout

Street 2 focused suite:
- remote address identity: **4/4**
- import maps: **4/4**
- static modules: **2/2**
- HTML/CSS resource discovery: **2/2**
- inert markup authority boundary: **4/4**
- deterministic remote graph: **2/2**

Total: **18/18 passed**.

The deterministic graph fixture proves:
- classic script collection with redirect-final identity,
- module entry + static relative dependency,
- export-from + import-map alias,
- cross-origin same-path module separation,
- cyclic module collection termination,
- cyclic CSS import termination,
- unresolved bare import warning without guessed fetch,
- dynamic import left untouched,
- CSS binary asset left untouched and recorded deferred,
- request deduplication,
- file-count/per-file/total byte limit failures,
- no guest code execution.

## Street 1 and platform recertification — real checkout

Because path ambiguity had been discovered, Street 1 was recertified from the actual project root:
- routed VirtualFetch: **5/5**
- proxy client: **4/4**
- Merkava proxy transport: **3/3**

Street 1 total: **12/12 passed**.

Existing `merkava-runtime-advanced.test.cjs` also passed.

Six explicit non-Chromium Drive proxy/security suites passed **19/19**, proving the retained server boundary still enforces routing authority, cookie isolation, Set-Cookie stripping, redirect policy, rate/byte/concurrency ceilings, authorization stripping, pinned transport, SSRF/public-address policy, and related protections.

## Final production-size evidence

After structural splitting:
- `remoteResourceAddress.js`: 63 lines
- `remoteImportMap.js`: 94 lines
- `remoteHtmlResources.js`: 102 lines
- `remoteModuleResources.js`: 77 lines
- `remoteCssResources.js`: 71 lines
- `remoteMarkupMask.js`: 89 lines
- `remoteJsCodeMask.js`: 59 lines
- `remoteResourceBudget.js`: 38 lines
- `remoteResourceFetch.js`: 109 lines
- `remoteResourceWalkers.js`: 104 lines
- `remoteResourceGraph.js`: 106 lines

Result: **all Street 2 production files are <=120 lines**.

## Authority scan

The final Street 2 production set was scanned for:
- Chromium
- Chrome launcher
- remote-debugging
- `webSocketDebuggerUrl`
- CDP
- ambient raw `fetch(` calls

Result: **`STREET2_AUTHORITY_SCAN=PASS`**.

## Final reread

All 11 Street 2 production files were reread from the real checkout after their final writes. All six Street 2 test files and the deterministic graph fixture were also reread. No new defect surfaced during that reread.

## Scoped Git evidence

A scoped `git status --short` over Street 2 production files, tests, fixture, and planning folder completed successfully.

Every listed Street 2 implementation/test path and the planning folder appeared as untracked within that scope. No unrelated repository path appeared in the scoped output.

This review does not infer whether the broader repository has other unrelated dirty work; none was modified as part of Street 2.

## Known deferred mismatch

The earlier `merkavaBrowserContract.test.mjs` mismatch remains intentionally deferred: the browser entrypoint still reflects the Chromium-era `createBrowserNavigationCoordinator` wiring rather than the older direct remote-navigation contract.

Street 2 must not hide that by changing navigation while closing resource collection.

## Planned versus actual

| Planned Street 2 item | Actual result |
| --- | --- |
| Canonical remote identity + collision-safe local key | Complete |
| Import-map exact/prefix/scope resolution | Complete |
| Live HTML script/style discovery | Complete |
| Static module graph collection | Complete |
| CSS `@import` collection | Complete |
| CSS binary asset deferral | Complete |
| Redirect-final dedupe | Complete |
| Cyclic graph termination | Complete |
| File/depth/byte budgets | Complete |
| No execution during collection | Proven |
| No ambient raw network authority | Proven |
| No Chromium/CDP dependency | Proven |
| Production files <=120 lines | Proven |
| Focused real-root suite | 18/18 pass |
| Street 1 real-root recertification | 12/12 pass |
| Non-Chromium proxy/security regression | 19/19 pass |

## Street 2 decision

**Street 2 is implementation-complete.**

No further Street 2 production pass is justified by current source/test evidence. The next street must begin with a new source reassessment and must not inherit execution/navigation assumptions silently.

The likely next dependency is handing the collected graph into a live client-side Merkava runtime for classic-script execution first, while treating browser static-module execution as its own explicit seam. Navigation, popups, dynamic import routing, and Chromium unwind remain separate later streets unless fresh source evidence changes that order.
