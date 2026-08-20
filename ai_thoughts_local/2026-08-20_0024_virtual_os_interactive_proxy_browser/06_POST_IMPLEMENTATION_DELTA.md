B"H
Boruch Hashem
Blessed is He

# Post-Implementation Delta

> The Awtsmoos reveals what plan became deed, and what deed revealed anew; Awtsmoos.com closes no circle until evidence makes the boundary true.

## Original plan
- Preserve the hardened HTTP fetch proxy as fallback.
- Add a real Chromium execution mode behind authenticated Drive routes.
- Keep cookies, profile state, debugger sockets, process identifiers, and network proxy internals server-side.
- Force Chromium HTTP/HTTPS traffic through a loopback-only SSRF-guarded proxy.
- Expose only narrow screenshot, navigation, history, input, target, and cleanup operations.
- Turn Chromium popup targets into contained Geelooy OS browser windows.
- Reuse one persistent user+jar login profile across multiple browser windows while assigning distinct page targets.
- Preserve all unrelated dirty work in the repository.
- Keep every touched implementation file at or below 120 lines.
- Verify with focused tests, existing browser regressions, syntax checks, real Chromium, real external HTTPS, input, popup lineage, and a non-credential Google Accounts render.

## What was actually implemented
### Server browser engine
- Opaque interactive session IDs and hashed user+jar profile keys.
- Private persistent Chromium profile directories with mode 0700 where supported.
- Loopback-only HTTP forward proxy.
- HTTP destination normalization and public-address pinning through the existing proxy policy.
- HTTPS CONNECT policy restricted to standard HTTPS and public destinations.
- Chromium launcher using a private profile, ephemeral localhost DevTools port, and forced loopback proxy.
- QUIC disabled and non-proxied WebRTC UDP disabled.
- Browser-level target catalog used only server-side to recover canonical popup `openerId` lineage.
- Page-level CDP controller limited to screenshots, validated navigation, history, bounded user input, cookie clearing, and target close.
- Per-user session ownership checks and target ownership checks.
- Public metadata reshaping that omits profile paths, PIDs, proxy ports, debug ports, and WebSocket debugger URLs.
- Session reuse per authenticated user+jar with a distinct Chromium target for each newly created Geelooy browser window.
- Idle session sweeping and deterministic runtime cleanup.

### Drive API
- Existing `/browser/fetch` and `/browser/jars` behavior preserved.
- Shared authenticated Drive actor gate extracted.
- Interactive session create/read/delete routes added.
- Safe target list/frame/navigate/history/input/cookie-clear/close routes added.
- Client cannot submit arbitrary CDP methods.

### Geelooy OS browser
- Same-origin interactive API client carrying only opaque session/target IDs and user actions.
- Image-frame overlay integrated into the existing browser stage rather than replacing Merkava.
- Pointer, wheel, keyboard, and text input mapping.
- Bounded frame and target polling without overlapping requests.
- Popup bridge converts direct Chromium child targets into `awtsmoosBrowser` virtual windows.
- Popup children reuse the same server session and target rather than creating a new browser profile.
- One navigation coordinator owns the toolbar to prevent double-bound actions.
- Interactive Chromium is preferred; existing HTTP/HTML renderer remains a fallback when Chromium is unavailable.
- Clear-cookie action clears both interactive Chromium cookies and the fallback HTTP proxy jar.

## Deltas discovered during implementation
1. Planned `/json/list` popup ancestry was insufficient: Chromium created popup page targets but `/json/list` omitted `openerId`.
	Resolution: added a server-private browser-level `Target.getTargets` catalog and merged only safe opener metadata into the public target list.
2. Initial session reuse would have navigated the first browser window when opening a second window.
	Resolution: reuse the browser session/profile but create a new Chromium target for each new Geelooy browser instance.
3. Interactive cookie clearing originally affected only the fallback HTTP jar.
	Resolution: added a fixed `Network.clearBrowserCookies` operation for the owned Chromium target and kept the fallback jar clear.
4. Initial Chromium launch allowed more network surfaces than desired.
	Resolution: disabled QUIC, disabled non-proxied WebRTC UDP, and removed `--remote-allow-origins=*` while keeping DevTools localhost-only.
5. Two implementation modules exceeded the 120-line project ceiling during the first pass.
	Resolution: split session actions from lifecycle and view synchronization/state from the browser controller. Final implementation maximum is 119 lines.
6. The first popup smoke used script-evaluated `window.open` and was correctly blocked by Chromium as lacking a user gesture.
	Resolution: final smoke creates a button and activates it through the actual pointer bridge, matching production browser behavior.
7. One smoke harness requested a complex object through the existing CDP helper and triggered a diagnostic serialization limitation.
	Resolution: diagnostic was corrected to primitive values; production code did not require a workaround.

## Planned versus actual completion
- Implementation complete: yes.
- Existing proxy behavior preserved: yes, browser regression suite passed.
- Real JS-capable browser engine: yes, direct Chromium runtime evidence.
- Server-side cookie/profile custody: yes by code boundary and public-client leakage scan.
- OAuth-style popup containment mechanics: yes, click-driven popup target with correct opener lineage plus Geelooy popup bridge tests.
- Google Accounts render capability: yes, real identifier page rendered without credential submission.
- Successful credentialed Google login: not claimed and not tested because no real credentials were entered.
- Arbitrary provider compatibility: not guaranteed; providers may independently restrict automated/headless environments.

## Remaining work after this delta
No known production implementation defect remains within the requested browser-proxy scope. Final evidence ledger and final remaining-work closure still need to be persisted and then read back when the tunnel accepts filesystem actions.
