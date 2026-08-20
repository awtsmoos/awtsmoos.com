B"H
Boruch Hashem
Blessed is He

# Final Execution Plan

> From hidden socket unto painted pane, the Awtsmoos renews the path again; Awtsmoos.com shall hold the key, while users touch the living web in liberty.

## Exact implementation sequence

### Phase A — inspect final contracts before code
- Read `publicAddressPolicy.js`, `proxyUrlPolicy.js`, and current full `browserRoutes.js` exports.
- Read current full `awtsmoos-browser/index.js` and `remoteSurface.js` immediately before rewrite so existing uncommitted work is preserved.
- Confirm Node runtime has global `WebSocket` or provide a server-only CDP adapter compatible with current runtime.

### Phase B — server code, complete-file writes only
1. `interactiveSessionIds.js`
	- normalize jar IDs using existing constraints.
	- generate opaque session IDs.
	- derive hashed owner/profile keys.
2. `interactiveProfileStore.js`
	- create 0700 profile root and per-owner profile.
	- never expose path outside server modules.
3. `interactiveLoopbackProxy.js`
	- loopback-only HTTP proxy + CONNECT handler.
	- reuse public-address resolver/pinning.
	- safe-port and timeout limits.
4. `interactiveChromeLauncher.js`
	- find Chrome executable.
	- allocate safe loopback debug port.
	- launch with profile + forced proxy + headless default.
	- readiness and deterministic stop.
5. `interactiveDevtoolsHttp.js`
	- local `/json/version`, `/json/list`, `/json/new`, `/json/close` only.
	- return internal metadata solely to service layer.
6. `interactiveTargetController.js`
	- dynamically reuse repository `CdpClient`.
	- Page.navigate, Page.captureScreenshot, browser history, Input dispatch.
	- strict action schemas and clamping.
7. `interactiveSessionStore.js`
	- per-owner maps, max sessions/targets, touch/idle metadata.
8. `interactiveSessionService.js`
	- create/reuse, target list, frame, navigation, input, close target/session.
	- public metadata redaction.
9. Rewrite `routes/browserRoutes.js`
	- preserve fetch/jar endpoints exactly in behavior.
	- add interactive authenticated endpoints using same Drive actor checks.

### Phase C — OS browser code, complete-file writes only
1. `interactiveClient.js`
	- authenticated Drive API wrapper; no secrets.
2. `interactiveSurface.js`
	- image viewport, loading/error/status, target metadata.
3. `interactiveInput.js`
	- pointer/wheel/key mapping with bounded payloads.
4. `interactivePopupBridge.js`
	- dedupe popup targets and call `os.addWindow({programName:'awtsmoosBrowser', content:{interactiveSessionId, interactiveTargetId, interactiveAliasId, interactiveJarId}})`.
5. `interactiveController.js`
	- start/reuse session, target/frame polling, navigation, lifecycle, popup bridge.
6. Rewrite `awtsmoos-browser/index.js`
	- preserve existing local and HTTP-proxy behavior.
	- prefer interactive controller for external navigation when alias exists and engine is available.
	- recognize child-target launch content.
	- degrade cleanly to current remote navigation if interactive engine reports unavailable.

### Phase D — tests only after implementation
- New server unit tests for ownership, redaction, IDs/profile path, proxy public/private decisions, session lifecycle.
- New client tests for request shapes and popup dedupe/open-window behavior.
- Run all existing Drive-browser proxy tests.
- Run all existing Awtsmoos-browser tests.
- Run syntax checks on every touched JS/CJS/MJS file.

### Phase E — real verification
- Launch local development server if required by the existing test harness.
- Exercise interactive session against a controlled local/policy-safe test site or fixture through the same browser engine.
- Verify real screenshot data, navigation, pointer/key effect, popup target creation, and cleanup.
- Exercise one benign external HTTPS page to prove network proxy path.
- Do not enter or record real provider credentials.
- Optionally load a Google sign-in page only to confirm render/navigation capability; do not claim successful Google authentication without direct evidence.

### Phase F — readback and delta
- Read every touched file completely.
- Compare this plan with actual files/tests/runtime evidence.
- Write `06_POST_IMPLEMENTATION_DELTA.md` and `07_COMPLETION_EVIDENCE.md`.
- Resolve every safe remaining item before final response.

## Files explicitly protected from accidental edits
- Secret/client credential JSON files in repository root.
- Unrelated modified Geelooy games, docs, agents, VFS, tunnel, social, and UI files shown by `git status`.
- Existing AI split-browser modules are reused read-only unless an integration defect forces a separately justified full-file rewrite.
