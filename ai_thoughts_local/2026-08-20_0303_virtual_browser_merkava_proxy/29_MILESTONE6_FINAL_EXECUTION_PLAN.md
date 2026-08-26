B"H
Boruch Hashem
Blessed is He

# Milestone 6 — Final Execution Plan

The Awtsmoos reveals the browser world through ordered vessels: first source becomes testimony, then testimony becomes payload, then payload enters a living local browser, and only afterward does navigation crown the whole road.

## Final production order

### 1. `embeddedPageMarkup.js`

Pure source processing.

Algorithm:
1. stringify original HTML,
2. create equal-length live-script-search mask using existing markup masker,
3. walk live `<script>` opening tags in source order,
4. locate matching closing tag in original source,
5. classify type:
   - classic: absent / javascript / ecmascript MIME -> executable,
   - module -> deferred warning,
   - importmap/data/unknown -> non-executable warning,
6. record each classic inline script as `{ index, start, end, source }`,
7. record external script tag span separately with `src` + module/classic testimony,
8. record stylesheet link tag spans,
9. strip every script tag and stylesheet link span from guest HTML,
10. strip `<base>` defensively,
11. return title + stripped markup + ordered inline script records + tag metadata + warnings.

No code executes here.

### 2. `embeddedPagePayload.js`

Pure graph join.

Algorithm:
1. parse original HTML with `embeddedPageMarkup`,
2. read `htmlResourceRefs(originalHtml, pageUrl)` for authoritative external refs,
3. build manifest alias lookup keyed by both `requestedUrl` and final `url`,
4. accept an external record only when:
   - manifest record exists,
   - graph file exists,
   - final URL origin equals canonical page origin,
   - resource kind matches expected kind,
5. combine inline scripts and accepted external classic scripts by source order,
6. concatenate accepted stylesheet text by source order,
7. modules/cross-origin/missing records become warnings, never guessed network access,
8. output immutable-ish plain payload `{ html, css, scripts, title, url, warnings }`.

### 3. `embeddedPageLoader.js`

Host fetch preparation.

Algorithm:
1. canonicalize requested page URL,
2. create `createMerkavaProxyTransport({ aliasId, jarId, projectId, pageUrl })`,
3. fetch document GET with HTML Accept header through transport,
4. require 2xx and string text,
5. canonicalize final response URL,
6. if final origin is different from requested origin, surface redirect to coordinator rather than silently changing runtime-origin assumptions,
7. recreate transport using final page URL,
8. collect bounded resource graph with final HTML/final URL/transport,
9. create page payload,
10. return `{ payload, transport, graph, response, pageUrl }`.

### 4. `embeddedPageRenderer.js`

One page-world lifecycle.

Algorithm:
1. validate `browserSurface.pageHost`,
2. remove empty-state visibility while mounted,
3. create `EmbeddedBrowserFrame`,
4. attach frame to page host,
5. create `EmbeddedBrowserBridge`,
6. create `EmbeddedNetworkBridge` with current page URL + transport,
7. subscribe READY/NAVIGATE/POPUP/ERROR,
8. create bounded READY promise before any render send,
9. after READY, send `HostToGuestType.RENDER` with payload,
10. expose `destroy()` that tears down network bridge, message subscriptions, message bridge, and iframe in reverse order,
11. expose guest navigation/popup callbacks to host coordinator,
12. never reuse a page world after committed top-level navigation.

### 5. `embeddedNavigationController.js`

History and trusted UI lifecycle.

State:
- entries array,
- history index,
- active renderer,
- active load generation token.

Navigate algorithm:
1. mark loading in host UI,
2. load payload,
3. discard stale completion when generation changed,
4. destroy previous renderer,
5. create renderer for canonical final page,
6. commit history unless navigation came from back/forward/reload,
7. update address/title/mode/status/history buttons,
8. clear loading.

Guest NAVIGATE callback re-enters coordinator routing rather than navigating directly.

### 6. `browserNavigationUi.js`

Small trusted chrome state adapter if needed.

Functions:
- `setLoading(surface, bool)`
- `setMode(surface, mode)`
- `setPage(surface, {url,title})`
- `setHistoryButtons(remote, state)`
- `setError(surface, remote, error)`

### 7. Rewrite `browserNavigationCoordinator.js`

No interactive Chromium import.

Creation:
- create embedded navigation controller,
- create safe proxy fallback controller only as explicit fallback,
- bind toolbar events.

Navigate:
1. call `chooseBrowserNavigation(value, { embeddedAvailable:true, proxyFallbackAvailable:true })`,
2. switch on mode:
   - native -> genuine native handoff, mode `Secure sign-in`,
   - embedded -> embedded navigation controller,
   - proxy-fallback -> old safe HTML fallback,
   - merkava-sandbox -> developer render mode,
   - blocked -> throw bounded policy error,
3. every guest navigation callback comes back through this same function.

History:
- embedded controller owns back/forward/reload when local page active,
- fallback owns its own history only while fallback active,
- native handoff does not pretend to join embedded history.

Clear jar:
- call existing `clearRemoteJar`; active embedded page remains but subsequent requests use cleared jar.

Destroy:
- embedded controller destroy,
- fallback destroy,
- remove listeners.

### 8. Entry point adjustments only if required by exact compile/runtime contract

Do not rewrite `index.js` unnecessarily. Prefer keeping existing signature and replacing behavior behind `createBrowserNavigationCoordinator`.

## Structural gates before tests

After production:
- `wc -l` every new/rewritten JS and CSS file,
- split >120,
- `node --check` every JS file,
- verify style import graph,
- grep normal coordinator/renderer path for `interactive`, `Chromium`, CDP, remote debugging,
- full reread of every production file.

## Behavioral tests

### Markup
- inline classic extraction order,
- comments/templates/inert contexts ignored,
- module deferred,
- script/style/base tags removed from payload markup,
- title extraction.

### Payload
- inline + same-origin external script order,
- stylesheet order,
- redirect alias resolution,
- cross-origin final record deferred,
- missing resource warning,
- no raw executable resource tag left in HTML.

### Loader
- document and graph use same host proxy context,
- canonical final URL,
- response rejection,
- graph bounds propagate.

### Renderer
- waits READY before RENDER,
- creates network bridge for page origin,
- guest NAVIGATE callback reaches host,
- destroy suppresses late traffic.

### Navigation controller/coordinator
- normal URL -> embedded,
- Google Accounts/provider-sensitive URL -> native handoff,
- embedded unavailable -> proxy fallback,
- back/forward/reload,
- clear jar,
- loading/mode/title/address updates,
- coordinator source has no interactive Chromium authority.

## Regression gate

After focused tests:
- shell tests/contract,
- containment suite,
- network suite,
- resource graph suite,
- native auth suite,
- proxy/profile suite,
- wider non-Chromium proxy/security suite.

## Completion testimony

Milestone 6 closes only when ordinary page navigation no longer imports or launches backend Chromium, a local embedded page reaches READY and receives a bounded render payload, runtime same-origin fetch is wired to the existing proxy, and provider-sensitive sign-in still takes the genuine native browser road.
