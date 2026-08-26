B"H
Boruch Hashem
Blessed is He

# Milestone 6 — File Map and Risk Review

The Awtsmoos gives the page two vessels: a bounded host preparation world and a living local browser world. Awtsmoos.com keeps those responsibilities separate so neither parsing nor network authority leaks into the renderer lifecycle.

## Production file graph

### New `embeddedPageMarkup.js`

Pure HTML/script extraction helpers.

Responsibilities:
- extract live inline classic script bodies in source order,
- identify script tag spans without treating comments/templates/raw-text stories as live authority,
- remove executable/resource tags from the HTML payload while preserving ordinary markup,
- extract document title when safely available,
- produce warnings for deferred module/import-map/data-script types.

Must reuse equal-length masking from `remoteMarkupMask.js` rather than inventing a second context parser.

### New `embeddedPagePayload.js`

Pure graph-to-guest payload assembly.

Input:
- original page HTML,
- canonical page URL,
- `collectRemoteResourceGraph()` result.

Output:
- `{ url, title, html, css, scripts, warnings }`.

Rules:
- inline classic scripts stay in document order,
- same-origin external classic scripts may be added in document order only when a graph/manifest record exists,
- same-origin styles may be concatenated only when a graph/manifest record exists,
- modules remain deferred with explicit warning,
- cross-origin fetched bodies are not exposed into the first authoritative guest payload,
- no raw `<script src>` or stylesheet link remains as ambient network authority.

### New `embeddedPageLoader.js`

Host network preparation only.

Responsibilities:
- create one `createMerkavaProxyTransport()` for page URL/session context,
- fetch the top-level document through the existing proxy,
- require 2xx + textual HTML,
- build bounded resource graph through the same transport,
- return payload + transport + canonical final URL.

Must not create iframe/bridge/UI state.

### New `embeddedPageRenderer.js`

One living embedded page world.

Responsibilities:
- own one `EmbeddedBrowserFrame`,
- own one `EmbeddedBrowserBridge`,
- own one `EmbeddedNetworkBridge`,
- mount frame into `browserSurface.pageHost`,
- wait for guest READY before first render,
- send `HostToGuestType.RENDER` payload,
- listen `NAVIGATE`, `POPUP`, `ERROR`,
- expose host callbacks for navigation/popup/error,
- update transport/network bridge on navigation by recreating the page world rather than mutating origin assumptions in-place,
- destroy all listeners/bridges/frame cleanly.

### New `embeddedNavigationController.js`

Host navigation state and renderer lifecycle.

Responsibilities:
- history stack/back/forward/reload,
- load page payload,
- recreate embedded page renderer for canonical URL,
- update address/tab title/mode/progress/status,
- route guest navigation intent back into host `navigate()`.

Must not parse HTML.

### Rewrite `browserNavigationCoordinator.js`

Becomes policy router only.

Imports:
- `chooseBrowserNavigation`,
- native browser handoff,
- embedded navigation controller,
- safe proxy fallback,
- `clearRemoteJar`.

Must NOT import or create `interactiveController` for ordinary navigation.

Routing:
- `native` -> genuine top-level browser handoff,
- `embedded` -> embedded controller,
- `proxy-fallback` -> safe HTML fallback,
- `merkava-sandbox` -> developer render path,
- `blocked` -> bounded host error.

### Possible small helper `browserNavigationUi.js`

Only if coordinator state updates threaten 120-line ceiling.

Owns:
- mode badge,
- progress classes,
- status text,
- tab title/address updates,
- history button disabled state.

## Critical risks and controls

### Script order drift

Risk: external and inline scripts execute out of original document order.

Control: collect source positions from original HTML; build one ordered action list before stripping tags.

### Cross-origin response oracle

Risk: graph preload fetches cross-origin script/style and payload exposes body where browser semantics would not.

Control: first payload includes external bodies only when `new URL(record.url).origin === pageOrigin`. Cross-origin records remain warnings/deferred.

### Redirect origin drift

Risk: same-origin requested resource redirects cross-origin and body becomes exposed.

Control: compare manifest final `url` origin against page origin, not only requested URL.

### Double execution

Risk: original script tags remain in markup and host also injects script bodies.

Control: strip all script tags before payload render. Guest sanitizer also strips script tags defense-in-depth.

### Stylesheet double/network execution

Risk: stylesheet links remain and iframe tries ambient network.

Control: strip stylesheet links; inject only host-collected same-origin CSS text.

### Guest readiness race

Risk: host sends render before bootstrap message listeners/network override are ready.

Control: renderer waits for `READY`, bounded timeout, then sends first payload.

### Stale network bridge after navigation

Risk: runtime fetch policy keeps previous page origin after navigation.

Control: recreate frame + bridge + network bridge per committed navigation.

### Native auth popup confusion

Risk: embedded guest requests Google identity URL and host tries to keep it embedded.

Control: every navigation intent re-enters `chooseBrowserNavigation`; provider-sensitive destinations always reach native handoff.

### False browser claims

Risk: UI says Local before renderer mounted or says signed in when only handoff opened.

Control: badges are state testimony: Loading, Local, Secure sign-in, Fallback, Error.

### Existing Chromium session child content

Risk: old `interactiveSessionId` launch content silently revives backend Chromium authority.

Control: coordinator does not auto-attach interactive sessions in normal path. Legacy interactive session fields are ignored or handled only in a later explicit compatibility mode.

## Test graph

- `awtsmoosBrowserEmbeddedPageMarkup.test.mjs`
- `awtsmoosBrowserEmbeddedPagePayload.test.mjs`
- `awtsmoosBrowserEmbeddedPageLoader.test.mjs`
- `awtsmoosBrowserEmbeddedPageRenderer.test.mjs`
- `awtsmoosBrowserEmbeddedNavigationController.test.mjs`
- rewrite/extend coordinator tests
- authority scan asserting normal coordinator path contains no interactive/Chromium/CDP import

## Stop boundary

Milestone 6 closes only when ordinary navigation is proven local-first and provider-sensitive identity navigation is proven native. Chromium files may still physically exist until a later unwind street, but they must no longer own normal navigation authority.
