B"H
Boruch Hashem
Blessed is He

# Native Browser Hybrid — Final Execution Plan

The Awtsmoos now reveals the road in layers: the user's browser should remain the living engine, Awtsmoos.com should guard the network crossing, and identity providers should receive a genuine top-level browser rather than a costume stitched from proxy headers.

## Final product promise

The Geelooy browser should behave as much like a normal local browser as web-platform and provider boundaries truthfully permit:

- local browser engine for DOM, CSS, JavaScript, focus, selection, forms, accessibility and rendering,
- hardened server proxy for authenticated HTTP routing, SSRF defense and proxied cookie jars,
- bounded forwarding of local browser UA/language testimony,
- real top-level local-browser handoff for Google OAuth and other flows that reject embedded developer-controlled agents,
- strict Merkava VM retained as fallback/sandbox rather than universal web engine,
- no backend Chromium process in the final authoritative path,
- polished host-owned browser chrome with tabs, omnibox, progress, mode/trust state and advanced session controls.

## Milestone 1 — Browser profile parity

### Create `browserClientProfile.js`

Exports:
- `collectBrowserProfile(navigatorObject = globalThis.navigator)`
- `sanitizeBrowserProfile(input)`

Rules:
- no high-entropy UA calls,
- UA max 512 characters,
- language strings max 64 characters,
- at most 8 languages,
- remove CR/LF/control characters,
- deduplicate languages,
- optionally preserve already-exposed low-entropy brands/mobile/platform for future use,
- never read cookies, credentials, hardware IDs or local storage.

### Rewrite `proxyClient.js`

Before rewrite, inspect existing tests.

Changes:
- import profile collector,
- attach `browserProfile` to every browser fetch payload unless caller explicitly supplies a sanitized profile,
- preserve body/base64 behavior,
- preserve cookie/set-cookie stripping,
- do not synthesize Origin/Referer/Host/Cookie.

### Create server `proxyBrowserProfile.js`

Exports:
- `sanitizeProxyBrowserProfile(profile)`
- `browserProfileHeaders(profile)`

Rules:
- duplicate validation server-side,
- derive only `user-agent` and deterministic `accept-language` initially,
- never produce arbitrary `sec-ch-*`, Origin, Referer or Cookie,
- return an empty object for absent/invalid testimony.

### Rewrite `proxyHeaders.js`

Before rewrite, inspect every call site.

Changes:
- accept validated browser-profile testimony without breaking existing callers,
- explicit safe request headers retain priority where appropriate,
- browser profile supplies UA/language when caller did not explicitly provide them,
- generic `AwtsmoosBrowser/1.0` fallback remains only for non-browser/test callers with no profile,
- `accept-encoding: identity` remains,
- cookie jar behavior remains server-owned.

### Verification

- client profile unit tests,
- proxy payload unit test,
- server profile-header tests,
- existing headers/cookies tests,
- existing auth/redirect/SSRF/proxy suites,
- line-count and secret/header scan.

## Milestone 2 — Secure native handoff

### Create `nativeNavigationPolicy.js`
- pure URL classifier,
- normalize supported schemes,
- explicit native mode,
- recognize Google OAuth authorization/sign-in endpoints and extensible identity-provider rules,
- never classify based on anti-bot bypass or UA spoofing.

### Create `nativeBrowserHandoff.js`
- real `window.open` from user gesture,
- `noopener` default,
- explicit blocked-popup result,
- no DOM inspection,
- no cookie transfer.

### Create `browserNavigationPolicy.js`
- choose `embedded`, `proxy-fallback`, `merkava-sandbox`, or `native`,
- return data only,
- preserve reason testimony for UI.

### Verification
- Google OAuth-classification test,
- ordinary Google/search URL stays non-native by default,
- explicit native mode,
- popup blocked/success states,
- no credential/cookie APIs referenced.

## Milestone 3 — Isolated native-browser feasibility

Before writing embedded runtime code, inspect deployment/server routing for a dedicated browser-only origin or subdomain capability.

Decision order:
1. dedicated isolated browser origin if existing infrastructure supports it safely,
2. otherwise sandboxed opaque-origin iframe compatibility mode,
3. never arbitrary remote JS on main Awtsmoos application origin.

Record exact limitations for:
- modules/dynamic import,
- service workers,
- WebSocket/EventSource/WebRTC,
- CSP/SRI,
- forms/location/window.open,
- Origin/Referer/SameSite/WebAuthn.

## Milestone 4 — Hybrid coordinator cutover

### Create `hybridNavigationCoordinator.js`
- no Chromium import,
- owns toolbar/omnibox navigation,
- native policy checked before proxy work,
- embedded controller first when available,
- existing remote HTML/Merkava path retained as fallback,
- native handoff state does not pollute ordinary proxy history.

### Rewrite `index.js`
- replace Chromium-first coordinator import,
- preserve OS close/resize lifecycle,
- create new browser chrome,
- keep developer tools behind advanced drawer.

### Contract proof
- source scan fails if hybrid coordinator imports `interactiveController.js`, CDP, Chromium or session targets.

## Milestone 5 — Futuristic browser chrome

### JavaScript modules
- `browserChrome.js`
- `browserTabs.js`
- `browserOmnibox.js`
- `browserNavButtons.js`
- `browserTrustState.js`
- `browserProgress.js`
- `browserSessionMenu.js`
- `browserNativePrompt.js`

### CSS modules
Each <=120 lines:
- `chrome-theme.css`
- `chrome-tabs.css`
- `chrome-toolbar.css`
- `chrome-status.css`
- `chrome-viewport.css`
- `chrome-motion.css`
- `chrome-responsive.css`

UX character:
- restrained glass and depth,
- calm gradients,
- tab insertion/selection/close motion,
- 120–220ms transform/opacity microinteractions,
- truthful finite loading indicator,
- clear native/isolated/proxy mode chip,
- secure handoff prompt rather than hidden popup retry,
- advanced session drawer contains alias/jar/reset/diagnostics,
- accessible native buttons/inputs,
- focus-visible,
- mobile/touch sizing,
- global reduced-motion fallback,
- opaque fallback where backdrop-filter is undesirable.

## Milestone 6 — Embedded native page bridge

Only after isolated-origin decision is proven.

Potential modules:
- `embeddedBrowserFrame.js`
- `embeddedBrowserBridge.js`
- `embeddedRequestBridge.js`
- `embeddedNavigationBridge.js`
- `embeddedPageBootstrap.js`

Requirements:
- local browser executes page DOM/CSS/JS,
- network intents route through host-owned proxy client where technically interceptable,
- typed postMessage protocol,
- strict origin/source validation,
- guest cannot read main Awtsmoos origin state,
- navigation/window.open requests go through host policy,
- unsupported network families fail visibly rather than silently bypassing proxy.

## Milestone 7 — Compatibility expansion

Treat each as its own verified seam:
- forms,
- location/history,
- module imports,
- dynamic imports,
- WebSocket,
- EventSource,
- downloads,
- popups/tabs,
- blobs/data URLs,
- service workers where feasible,
- CSP/SRI testimony.

No feature is considered supported merely because one demo site works.

## Milestone 8 — Chromium cleanup

Only after the hybrid path is authoritative and regression-proven:

1. trace imports/routes/tests for every `interactive*` / Chromium file,
2. prove production entrypoint no longer references them,
3. remove client Chromium modules by full-file/directory-safe deletion,
4. remove server interactive Chromium routes/session launchers,
5. rerun proxy/security/browser suites,
6. process scan proves no backend Chromium is launched by Geelooy browser.

## Milestone 9 — Finish strict Merkava fallback

Return to the in-progress strict VM hardening:
- reconcile/create `functionFrames.js`,
- rewrite/split native-call executor,
- update VM loaders,
- hostile constructor/prototype/native-call escape tests,
- keep it as explicit sandbox/fallback mode.

Do not make this fallback block ordinary native-browser rendering once Milestones 1–6 are proven.

## Final verification universe

### Controlled HTTP endpoint
Assert upstream receives:
- expected local-browser UA,
- deterministic Accept-Language,
- no browser-program Cookie header from client,
- no forged Origin/Referer,
- server jar cookie only where appropriate.

### Local browser page
Assert:
- DOM/CSS/JS execute in actual local browser engine,
- fetch/XHR uses routed bridge for supported paths,
- same persistent host tab/window state behaves normally.

### Identity handoff
Assert:
- Google OAuth policy URL is not rendered in embedded proxy mode,
- one user gesture opens real top-level destination,
- blocked popup produces explicit in-app action,
- no credentials or provider cookies enter Awtsmoos logs/state.

### UI/accessibility
Assert with screenshots and keyboard interaction:
- desktop,
- narrow/mobile window,
- loading,
- error,
- isolated mode,
- native handoff prompt,
- advanced session drawer,
- reduced motion.

### Security
Re-run:
- SSRF/public-address policy,
- redirect policy,
- header stripping,
- cookie isolation,
- rate/concurrency/byte limits,
- Authorization stripping,
- no Chromium/CDP authority in production browser path.

## Immediate next action

Inspect existing `browserRequestHeaders()` call sites and existing proxy-client tests. Then implement Milestone 1 by complete-file writes only.

The Awtsmoos does not confuse resemblance with truth: the proxy may carry the browser's voice, but only the browser itself may carry its origin, its passkeys, its provider trust, and its living native view.
