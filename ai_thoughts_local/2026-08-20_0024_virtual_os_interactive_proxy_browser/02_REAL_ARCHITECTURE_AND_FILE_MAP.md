B"H
Boruch Hashem
Blessed is He

# Pass Two — Real Architecture and File Map

> In chesed the page may wander, in gevurah the gate stays tight; the Awtsmoos joins both measures so Awtsmoos.com can browse in light.

## Chosen architecture
The existing HTTP `ProxyService` remains the non-JavaScript fallback. A separate interactive engine owns a real Chromium process and never exposes DevTools to the web client.

### Server flow
1. Authenticated Drive actor creates/reuses an interactive browser session for one `jarId`.
2. Session manager derives an opaque profile key from authenticated user + jar, creates a 0700 profile directory, and starts a loopback-only proxy.
3. Chromium launches with a loopback DevTools port and `--proxy-server` pointing at the private forward proxy.
4. Forward proxy validates every HTTP destination or HTTPS CONNECT host with existing public-address rules before opening the outbound socket.
5. Session manager creates a page target and returns only `{sessionId, targetId, url, title}` metadata.
6. Client polls target metadata and screenshots through authenticated Drive routes.
7. Client sends narrow navigation, pointer, wheel, keyboard, and close-target commands.
8. A target whose opener belongs to the session is reported as a popup; the Geelooy browser opens it through `os.addWindow`.

## Cookie decision
- Cookie values remain in Chromium's server-side profile.
- Raw Cookie and Set-Cookie data are never returned to Geelooy OS JavaScript.
- Existing HTTP-proxy jars remain unchanged for fallback mode.
- Interactive jar/profile IDs reuse normalized `jarId`, but the profile path uses a SHA-256 digest so user IDs never become filesystem paths.
- This pass does not invent client-side cookie encryption; keeping secrets off the client is simpler and safer.

## Network decision
- No unauthenticated forward proxy is exposed.
- Each interactive session owns a loopback listener only.
- HTTP absolute URLs and CONNECT hosts are checked before forwarding.
- Only HTTP/HTTPS external navigation is accepted.
- CONNECT ports default to 443; HTTP proxy destinations default to 80/443.
- Existing public-IP/private-IP rejection is reused.
- DNS is resolved by the trusted server policy before the outbound socket connects to the selected public address.

## Files expected to create
Server interactive engine, split into narrow modules:
- `geelooy/api/social/helper/drive/browser/interactiveSessionIds.js`
- `geelooy/api/social/helper/drive/browser/interactiveProfileStore.js`
- `geelooy/api/social/helper/drive/browser/interactiveLoopbackProxy.js`
- `geelooy/api/social/helper/drive/browser/interactiveChromeLauncher.js`
- `geelooy/api/social/helper/drive/browser/interactiveDevtoolsHttp.js`
- `geelooy/api/social/helper/drive/browser/interactiveTargetController.js`
- `geelooy/api/social/helper/drive/browser/interactiveSessionStore.js`
- `geelooy/api/social/helper/drive/browser/interactiveSessionService.js`

Client interactive surface, split by responsibility:
- `geelooy/os/programs/awtsmoos-browser/interactiveClient.js`
- `geelooy/os/programs/awtsmoos-browser/interactiveSurface.js`
- `geelooy/os/programs/awtsmoos-browser/interactiveInput.js`
- `geelooy/os/programs/awtsmoos-browser/interactivePopupBridge.js`
- `geelooy/os/programs/awtsmoos-browser/interactiveController.js`

Tests:
- `geelooy/api/social/helper/drive/browser/interactiveSession.test.js`
- `geelooy/api/social/helper/drive/browser/interactiveLoopbackProxy.test.js`
- `geelooy/os/test/awtsmoosBrowserInteractiveClient.test.mjs`
- `geelooy/os/test/awtsmoosBrowserPopupBridge.test.mjs`

## Existing files expected to rewrite completely if needed
- `geelooy/api/social/helper/drive/routes/browserRoutes.js` — add authenticated interactive routes while preserving current fetch/jars routes.
- `geelooy/os/programs/awtsmoos-browser/index.js` — choose interactive mode when available and accept popup child target options while preserving current fallback behavior.
- Potentially `geelooy/os/programs/awtsmoos-browser/remoteSurface.js` only if the current DOM cannot host an image surface cleanly; otherwise leave untouched.

## Route surface
- `POST /browser/sessions` create/reuse session.
- `GET /browser/sessions/:sessionId` session metadata + targets.
- `DELETE /browser/sessions/:sessionId` stop session without exposing profile secrets.
- `POST /browser/sessions/:sessionId/navigate` navigate an owned target.
- `GET /browser/sessions/:sessionId/targets` list owned targets/popups.
- `GET /browser/sessions/:sessionId/targets/:targetId/frame` capture JPEG/PNG frame as base64 JSON.
- `POST /browser/sessions/:sessionId/targets/:targetId/input` narrow pointer/key/wheel input.
- `DELETE /browser/sessions/:sessionId/targets/:targetId` close one target.

## Non-goals for this pass
- Do not expose raw CDP websocket URLs.
- Do not build a public generic proxy.
- Do not promise every provider will allow automated/headless login.
- Do not log credentials or cookies.
- Do not modify unrelated dirty files.
- Do not remove the existing HTTP proxy fallback.

## Verification graph
API authorization -> session ownership -> loopback-only network -> public-address validation -> Chromium launch -> target discovery -> frame capture -> input -> popup discovery -> Geelooy child window -> cleanup.
