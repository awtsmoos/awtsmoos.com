B"H
Boruch Hashem
Blessed is He

# Pass Three — Thirty-Two Final Architecture Improvements

> The Awtsmoos renews the hidden wire, the guarded gate, the living screen; Awtsmoos.com should reveal a browser powerful yet clean.

This final review converts the prior architecture into implementation invariants.

1. Interactive mode must be feature-detected; fallback mode stays usable without Chrome.
2. Chrome path must be configurable through `CHROME_PATH` and common platform defaults.
3. Debug port selection must avoid hard-coded shared ports.
4. Profile path must be stable per user+jar but process ownership must prevent simultaneous profile corruption.
5. Session creation must reuse an already-live session for the same user+jar when safe.
6. A session must contain process PID, proxy handle, debug port, target registry, timestamps, and owner key only server-side.
7. API metadata must omit PID, debug port, proxy port, profile path, and websocket URL.
8. Chrome must start only after the loopback proxy is listening.
9. Chrome command line must force the loopback proxy and bypass no external hosts.
10. Loopback DevTools must never listen on non-loopback interfaces.
11. Browser process shutdown must close targets, DevTools client, proxy sockets, and process family.
12. Session deletion must be idempotent.
13. Session idle expiry must refresh only on authenticated activity.
14. Target lists must filter internal Chrome pages and extension targets.
15. The first page target becomes the root target; popup targets retain `openerId` metadata.
16. Popup client bridge must ignore already-seen targets and the root target.
17. Popup child windows must receive the existing session ID + child target ID through program `content`, not URL query secrets.
18. Child windows must never create a second session when a valid owned session/target pair was supplied.
19. Child close must close only the target; root close may stop the session when it is the last attached OS browser.
20. Frame polling must pause when the document/window is hidden or target is unavailable.
21. Frame polling interval must be bounded to avoid server overload.
22. Frame response must include URL/title/viewport metadata beside base64 image, never sensitive storage.
23. Pointer coordinates must be mapped from rendered image bounds to browser viewport coordinates.
24. Keyboard events must distinguish keyDown/keyUp/text insertion without allowing arbitrary protocol commands.
25. Wheel events must clamp deltas and coordinates.
26. Navigation must validate the requested URL at the application boundary even though the proxy validates the network destination again.
27. Back/forward/reload must use CDP browser history, not merely client history.
28. Existing HTTP-proxy jar controls must remain available and unchanged in the same browser UI.
29. Interactive failure messages must be user-readable but must not leak server filesystem/process details.
30. Tests must inject launch/network/CDP dependencies so failure branches are deterministic.
31. Real smoke verification must use a controlled local page for popup/input and a benign external public page for proxy networking; it must not submit real credentials.
32. Final report must distinguish “engine works” from “specific provider login verified”; Google or another provider may impose policies outside this code.

## Final module boundaries
- Identity/profile: pure functions and filesystem permission setup.
- Network gate: loopback HTTP/CONNECT proxy with public-address resolution.
- Process: Chrome launch/readiness/termination.
- DevTools HTTP: create/list/close targets and fetch websocket metadata server-side.
- Target controller: screenshot/navigation/history/input only.
- Session store/service: ownership, resource limits, cleanup, orchestration.
- Routes: authentication + schema extraction only.
- Client API: fetch contracts only.
- Surface: image rendering/status only.
- Input: DOM events -> narrow API payloads.
- Popup bridge: target metadata -> `os.addWindow` only.
- Controller: lifecycle/polling glue.

## Completion gate
The feature is complete only when source tests pass, existing proxy tests remain green, local interactive smoke produces a real frame and popup target, touched files are read back, and remaining-work ledger has no unverified implementation item.
