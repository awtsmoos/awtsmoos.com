B"H
Boruch Hashem
Blessed is He

# Pass Two Critique — Twenty-Four Improvements

> The Awtsmoos tests each vessel before the river runs; Awtsmoos.com guards the many while the Source is One.

This is a design-review ledger, not private reasoning. Each item is a concrete requirement added before implementation.

1. Never return DevTools websocket URLs to the client.
2. Bind every session lookup to authenticated user identity, never session ID alone.
3. Bind every target lookup to an owned session, never target ID alone.
4. Use cryptographically random session IDs.
5. Hash user + jar before deriving a profile directory name.
6. Make profile roots and browser-created subdirectories inaccessible to other OS users where possible.
7. Keep the forward proxy loopback-only and on an ephemeral port.
8. Validate HTTP proxy absolute URLs with the same public-address policy as fetch mode.
9. Validate CONNECT destinations before dialing and pin the chosen public address.
10. Reject CONNECT to arbitrary ports; allow the browser-safe set explicitly.
11. Add connection timeouts so stalled CONNECT tunnels cannot live forever.
12. Cap active sessions per authenticated user.
13. Cap active targets per session so popup storms cannot exhaust the server.
14. Add idle cleanup; closing the last client target must not orphan Chromium forever.
15. Keep existing rate/peruta controls for fetch mode unchanged.
16. Return only title/url/opener metadata from target listings; no headers/cookies/storage.
17. Capture compressed JPEG by default to bound frame payloads.
18. Clamp requested frame dimensions and quality.
19. Clamp pointer coordinates, wheel deltas, and key payload sizes before CDP dispatch.
20. Permit only an explicit list of CDP input actions; never accept arbitrary CDP methods from the client.
21. Treat popup discovery as polling-compatible first; do not require a fragile long-lived web socket to ship this pass.
22. Deduplicate popup windows client-side by session + target ID.
23. Ensure a child browser window does not destroy the shared session when only its target closes.
24. Preserve the current HTTP renderer as graceful fallback when Chromium is unavailable.

## Additional failure checks
- Chrome executable absent -> return `interactive_browser_unavailable`, not a 500 stack leak.
- DevTools startup timeout -> terminate child process and loopback proxy.
- Forward proxy startup failure -> never launch Chrome without proxy enforcement.
- Profile lock already owned -> reuse only the exact owned session or return a bounded conflict.
- Private hostname resolving after redirect -> connection rejected by proxy layer.
- Client closes OS window during in-flight frame request -> polling stops without leaking timers.
- Popup closes itself -> Geelooy window notices missing target and closes or shows a stable closed state.
- Browser process dies -> session state becomes unavailable and cleanup removes runtime resources.
- Navigation to `file:`, `data:`, `javascript:`, `chrome:`, localhost, RFC1918, metadata endpoints -> rejected by route or network gate.
- Google/provider refusal -> surface provider error faithfully; never weaken security controls to bypass provider policy.

## Revised implementation priority
1. Secure IDs/profile path.
2. Loopback forward proxy.
3. Chrome launcher + DevTools discovery.
4. Target controller with navigation/frame/input.
5. Owned session service.
6. Authenticated routes.
7. Client API.
8. Image/input surface.
9. Popup window bridge.
10. Browser program integration.
11. Unit/integration tests.
12. Real local Chromium smoke.
