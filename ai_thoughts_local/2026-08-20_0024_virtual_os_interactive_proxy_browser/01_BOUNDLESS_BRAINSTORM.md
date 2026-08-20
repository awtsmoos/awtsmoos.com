B"H
Boruch Hashem
Blessed is He

# Pass One — Boundless Browser Revelation

> The Awtsmoos renews each route in light; Awtsmoos.com should make each distant site feel near and right.

## Mission
Build the Geelooy OS browser into a regular-browser-like vessel without exposing remote cookies, debugger sockets, host windows, or unrestricted server networking.

## Observed foundations
- `geelooy/os/programs/awtsmoos-browser` already has local Merkava rendering and server-proxy remote navigation.
- `proxyClient.js` sends only `jarId`; cookie values remain server-side.
- `remoteNavigationController.js` currently fetches HTML and paints text; it does not execute arbitrary site JavaScript.
- Drive browser proxy code already applies authenticated actor checks, URL normalization, public-address policy, redirect limits, rate limiting, peruta accounting, response size limits, pinned DNS transport, and cross-origin Authorization stripping.
- `geelooy/ai/relay/split-browser` already proves this repository can launch and drive a persistent Chrome profile through DevTools.
- Geelooy programs receive the `os` object and may call `os.addWindow(...)`, so popups can stay inside the virtual OS.

## Five candidate architectures
1. Rewrite every remote page and script through the HTTP proxy.
	- Strong CORS bypass and low server cost.
	- Breaks modern apps, service workers, CSP, dynamic imports, OAuth, browser APIs, and anti-embedding policy.
2. iframe a reverse-proxy URL.
	- Simple visual fidelity.
	- OAuth providers often reject embedded user agents; origin rewriting becomes fragile and dangerous.
3. Run server-side Chromium and expose raw DevTools/WebSocket to the client.
	- Maximum browser power.
	- Rejected: debugger access is too privileged and would leak page/cookie/process capabilities.
4. Run server-side Chromium behind narrow authenticated session APIs.
	- Real JS/browser semantics, opaque target IDs, screenshot/input bridge, popup discovery.
	- Chosen interactive architecture.
5. Require each user to install a local tunnel and remote-control their own native Chrome.
	- Excellent login compatibility and local cookie custody.
	- Useful optional future transport, but not acceptable as the only web browser for hosted Geelooy OS.

## Ideal interactive experience
- Address bar accepts HTTP/HTTPS URLs.
- Browser opens or reuses an authenticated interactive session bound to Drive actor + jar.
- Page executes in real Chromium.
- User sees Chromium frames inside the Geelooy browser surface.
- Pointer, wheel, keyboard, focus, back/forward/reload, and typed navigation become narrow server commands.
- `window.open`, target=_blank, and OAuth popups appear as new Chromium targets.
- New targets are surfaced as sibling Geelooy browser windows, never host OS windows.
- Closing a Geelooy popup closes only its owned Chromium target.
- Cookies, localStorage, IndexedDB, CacheStorage, service workers, and session state stay in the server-side browser profile.
- Client never receives raw Cookie, Set-Cookie, DevTools URL, profile path, or authorization headers.

## Security perimeter
- Session IDs are cryptographically random and always checked against authenticated user identity.
- Target IDs are never sufficient authorization; every target action requires session ownership.
- External navigation allows only HTTP/HTTPS and retains private-address blocking.
- Browser engine binds debugging and network proxy listeners to loopback only.
- Chrome network traffic is forced through a loopback forward proxy where public-address resolution is revalidated.
- CONNECT is limited to public hosts and safe ports.
- Session/profile directories are mode 0700 and keyed by a hash rather than raw user identifiers.
- Resource limits cap sessions, targets, frame size, request frequency, and idle lifetime.
- No generic public proxy endpoint is introduced.

## Future extensions
- Native-tunnel Chrome transport for sites hostile to datacenter/headless browsers.
- Server-side encrypted profile vault and explicit "Forget this browser" profile erasure.
- WebRTC/audio forwarding.
- Download manager into virtual VFS.
- Clipboard mediation with explicit user gestures.
- Permission prompts surfaced as Geelooy dialogs.
- Accessibility-tree transport for low-bandwidth rendering.
- WebSocket streaming of CDP screencast frames after REST polling is proven.

## Completion evidence sought
- Existing proxy tests stay green.
- Session ownership and URL policy tests pass.
- Interactive client request-shape tests pass.
- Popup target discovery opens one contained OS browser window in simulation.
- Local real Chromium can navigate a controlled page, produce a screenshot, receive input, and expose a popup target.
- No cookie values appear in API responses or browser client source.
