B"H
Boruch Hashem
Blessed is He

# Native Browser Hybrid — Phase 2 Reality and File Map

The Awtsmoos reveals the actual browser beneath the old garments. Awtsmoos.com already has a hardened request road, but the visible browser still points first toward server Chromium and displays developer plumbing where a user expects tabs, an omnibox, trust state, and a living page.

## Observed current reality

### `proxyClient.js`
- Sends only caller-supplied headers after stripping cookie/set-cookie.
- Does not capture `navigator.userAgent`, languages, or UA Client Hints.
- Therefore the backend cannot currently mirror the local browser profile automatically.

### `proxyHeaders.js`
- Upstream request headers are allowlisted.
- `user-agent` and `accept-language` are already allowed.
- Missing UA becomes `AwtsmoosBrowser/1.0`.
- Server-side jar adds `cookie` after request-header filtering.
- Cross-origin Authorization stripping exists elsewhere and must remain unchanged.
- `sec-ch-ua*` is not currently allowed.

### `browserNavigationCoordinator.js`
- Chromium is currently the preferred navigation engine.
- It reports `Interactive Chromium connected` when successful.
- Safe HTML proxy navigation is only fallback.
- Toolbar bindings are owned here, so this is the authority that must be replaced rather than cosmetically bypassed.

### `remoteNavigationController.js`
- Contains one clean `navigate()` funnel for proxy fetch + history.
- Good reusable fallback seam.
- Currently renders fetched text through the Merkava editor/canvas path rather than a native DOM page.

### `index.js`
- Instantiates developer `surface.js` first.
- Instantiates `remoteSurface.js` and then Chromium-first `browserNavigationCoordinator.js`.
- Loads only `style.css` and `remote.css` for browser-specific chrome.
- This is the composition root that eventually switches to the new hybrid coordinator.

### `surface.js`
- Development workbench: brand, address, Render, Self-host, depth, HTML/CSS editor, canvas stage, metrics.
- Useful as dev/fallback inspector, not appropriate as primary end-user browser chrome.

### `remoteSurface.js`
- Alias and jar IDs are primary visible inputs.
- Back/forward/reload/Go/Clear jar are a second toolbar row.
- Status is plain text.
- No tabs, favicon/title, security state, page-mode state, loading progress, native handoff affordance, menu, or polished focus/navigation model.

### `style.css` / `remote.css`
- Existing dark glass language is usable as a seed.
- Current composition is a workbench split editor + canvas.
- Motion is nearly absent; reduced-motion only disables one button transition.
- Remote controls are functional but visually diagnostic.

## Product architecture selected

```text
Geelooy Browser Window
	↓
Browser Chrome (host-owned)
	├─ tabs / omnibox / nav / trust / progress / mode
	├─ advanced session popover (alias, jar, diagnostics)
	└─ page viewport
		├─ embedded isolated native-browser mode
		│   └─ local browser DOM/CSS/JS
		│       └─ same-origin browser-isolation request bridge
		│           └─ hardened Awtsmoos HTTP proxy + server cookie jar
		├─ strict Merkava fallback/sandbox
		└─ real top-level native browser handoff
		    └─ Google/OAuth/WebAuthn/origin-sensitive sites
```

## Phase A — local browser profile contract

### New client file: `browserClientProfile.js`
Responsibilities:
- Read bounded, low-entropy local browser profile.
- Sanitize UA/language strings and cap lengths/counts.
- Expose a deterministic profile object.
- Never read cookies, credentials, high-entropy UA hints, or hardware identifiers.

Initial profile fields:
- `userAgent`
- `language`
- `languages`
- `uaBrands` if already exposed synchronously by `navigator.userAgentData`
- `mobile` if exposed
- `platform` if exposed

Important: viewport/DPR may be collected separately for rendering UX, not forwarded as identity headers.

### Full rewrite: `proxyClient.js`
- Attach `browserProfile` to fetch payload.
- Preserve explicit caller headers only through existing safe filter.
- Do not synthesize cookie, set-cookie, host, origin, referer, or proxy-control headers on the client.

### New server file: `proxyBrowserProfile.js`
- Validate/cap structured profile.
- Derive only permitted UA/language testimony.
- Do not trust a raw arbitrary `sec-ch-*` header bag from the client.
- Keep browser-profile parsing separate from generic request-header allowlisting.

### Full rewrite: `proxyHeaders.js`
- Merge validated profile UA/language only when safe.
- Preserve identity fallback for clients with no profile.
- Preserve `accept-encoding: identity` and existing request allowlist.
- Do not weaken cookie or Authorization boundaries.

### Tests
- new client profile test,
- proxyClient payload test,
- proxyHeaders/browser-profile test,
- rerun headers/cookies/auth regression.

## Phase B — native secure handoff policy

### New file: `nativeNavigationPolicy.js`
Responsibilities:
- Normalize URL.
- Classify known embedded-disallowed identity endpoints.
- Classify explicit user-selected native mode.
- Return data only: `{ mode, reason, url }`.

Rules:
- Google OAuth authorization pages require native/top-level context.
- Do not treat every Google domain as OAuth automatically.
- Any page can be manually opened in native mode.
- Never classify based on UA spoofing opportunity.

### New file: `nativeBrowserHandoff.js`
Responsibilities:
- Open destination with real `window.open` only from a user gesture.
- Use `noopener` where compatible with return-flow requirements.
- If popup blocked, return explicit blocked state for UI.
- Never inspect cross-origin DOM or copy cookies back.

### New file: `browserNavigationPolicy.js`
Responsibilities:
- Decide among `embedded`, `proxy-fallback`, `merkava-sandbox`, `native`.
- Keep provider policy separate from navigation mechanics.

## Phase C — remove Chromium as navigation authority

### New file: `hybridNavigationCoordinator.js`
- Replaces `browserNavigationCoordinator.js` at composition root.
- No import of `interactiveController.js`.
- Owns address Enter, back, forward, reload, mode switching, secure handoff.
- Uses embedded page controller first.
- Uses existing `remoteNavigationController` only as fallback.

### Full rewrite: `index.js`
- Instantiate new browser chrome and hybrid coordinator.
- Stop creating Chromium controller/session.
- Preserve OS lifecycle/onclose/onresize.
- Preserve dev Merkava tools only behind optional advanced/developer mode.

### Later deletion/unwind
After all replacements/tests are green, remove or archive Chromium interactive client/server routes and helpers in a separate verified cleanup pass. Do not delete them before the new path has proven parity.

## Phase D — embedded native page surface

Preferred target: dedicated browser-only origin, never main Awtsmoos app origin.

### New browser host modules
- `embeddedBrowserFrame.js`: iframe/frame lifecycle and mode state.
- `embeddedBrowserBridge.js`: typed parent/guest messages.
- `embeddedRequestBridge.js`: guest request intents to host proxy client.
- `embeddedNavigationBridge.js`: links/forms/location/window.open testimony.
- `embeddedPageBootstrap.js`: injected page-side bridge for fetch/XHR/navigation as technically feasible.

### Security invariant
Arbitrary remote JS must never execute with same-origin access to the main Awtsmoos application window/storage/cookies.

If dedicated-origin deployment support is not available yet, the fallback embedded mode must use sandbox isolation without `allow-same-origin`. The product must show that compatibility mode honestly rather than silently weakening isolation.

## Phase E — futuristic browser chrome

### New JS modules
- `browserChrome.js`: composition root for host chrome.
- `browserTabs.js`: tabs, selection, close/new motion state.
- `browserOmnibox.js`: address editing, URL/domain display, Enter semantics.
- `browserNavButtons.js`: back/forward/reload/home controls.
- `browserTrustState.js`: lock/mode/security presentation only; never counterfeit real browser security chrome.
- `browserProgress.js`: deterministic loading progress state.
- `browserSessionMenu.js`: alias/jar/clear-cookie diagnostics hidden behind advanced menu.
- `browserNativePrompt.js`: secure top-level handoff banner/chip.

### CSS split, each <=120 lines
- `chrome-theme.css`: variables, surfaces, system dark/light.
- `chrome-tabs.css`: tabs and tab motion.
- `chrome-toolbar.css`: nav + omnibox + menu.
- `chrome-status.css`: trust/mode/progress/handoff states.
- `chrome-viewport.css`: viewport, empty/loading/error states.
- `chrome-motion.css`: transitions/keyframes + reduced-motion overrides.
- `chrome-responsive.css`: touch/mobile/compact widths.

### Motion language
- 120–220ms micro-interactions.
- Transform/opacity for most motion.
- Spring-like tab entry through cubic-bezier, not heavy JS animation.
- Progress bar uses finite load-state transitions, not infinite decorative shimmer after completion.
- Respect `prefers-reduced-motion` globally.
- Focus-visible remains immediate and high contrast.

## Phase F — tests and visual proof

Functional:
- profile sanitation and forwarding,
- header isolation,
- native handoff classifier,
- popup-blocked state,
- hybrid coordinator never imports/starts Chromium,
- alias/jar remain host-only,
- embedded guest cannot access parent app origin.

Visual/accessibility:
- keyboard traversal of tabs/nav/omnibox/menu,
- 44px touch targets where space permits,
- narrow-window responsive layout,
- dark/light contrast,
- reduced-motion behavior,
- loading/error/native-handoff states.

Runtime:
- local controlled page executes browser JS/DOM locally,
- routed fetch reaches hardened proxy,
- upstream sees bounded local UA + Accept-Language,
- no claim of TLS/IP/header-order fingerprint equivalence,
- OAuth policy target opens real top-level browser instead of embedded proxy.

## Files not to change in first production milestone

- `interactiveController.js` and server interactive Chromium files: leave inert until cleanup street.
- strict Merkava VM hardening: retain as fallback work, but do not make it the primary arbitrary-web renderer.
- proxy SSRF/DNS pinning/cookie jar/redirect policy: preserve and regression-test.

## Phase 2 decision

First production change should be **browser profile parity**, because it is small, independently testable, and required by both current proxy fallback and future native embedded mode.

Second production change should be **secure native handoff policy**.

Only after those two boundaries are green should the Chromium-first coordinator be replaced and the visible futuristic browser chrome become authoritative.
