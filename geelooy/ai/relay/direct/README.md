B"H
Boruch Hashem
Blessed is He

# Geelooy Direct ChatGPT Relay

The Awtsmoos recreates every browser route, request vessel, Sentinel decision, WebSocket frame, and answer. This relay now distinguishes strict request-only capability from the older page-authorized carrier fallback instead of silently mixing them.

## Result

A normal authenticated Chrome tab on a non-home ChatGPT route is a useful request host.

The following routes were tested:

- `/settings`
- `/settings/general`
- `/settings/data-controls`
- a deliberate nonexistent route
- a fake share route

In normal Chrome they remained authenticated, avoided Cloudflare, and opened the page-owned ChatGPT topic socket.

Changing the route did not make headless Chrome acceptable to ChatGPT. Headless `/settings`, the deliberate 404, and the fake-share route still returned Cloudflare or 403 responses. This project does not bypass that challenge.

## Strict request-only capability

The strict pipeline now performs all of these steps without focusing, typing into, clicking, or submitting the composer:

1. Open an authenticated `/settings` host tab.
2. Observe the current application's ordinary client headers in memory.
3. Open and retain the page-owned ChatGPT topic socket.
4. Build the ordinary conversation-prepare body from public defaults, runtime timezone, and a fresh parent identifier.
5. POST `/backend-api/f/conversation/prepare` through same-origin page fetch.
6. Receive a fresh conduit token in transient memory.
7. POST `/backend-api/sentinel/chat-requirements/prepare` through requests.
8. Load and invoke only the public Sentinel SDK methods `init`, `token`, and `timing`.
9. Stop before chat-requirements finalization when the server requires normal enforcement.

The live server response currently requires:

- Turnstile
- proof of work
- session observer enforcement

No proof algorithm, Turnstile solver, challenge bypass, or enforcement-token fabrication is implemented.

## Public relay routes

- `GET /direct-health`
- `GET /direct-capability`
- `POST /direct-chat`
- `POST /direct-reset`

The raw `/direct-chat` API defaults to:

```json
{
	"mode": "strict-request-only"
}
```

When normal enforcement is required, it returns HTTP 409 with:

```json
{
	"error": "direct_enforcement_required"
}
```

It does not construct the carrier client or send a conversation POST.

## Explicit fallback

Actual chat can still use the previously validated carrier-assisted path, but it must now be named:

```json
{
	"prompt": "Your prompt",
	"mode": "page-authorized-fallback"
}
```

Only that explicit mode may touch the composer to obtain a fresh page-authorized envelope. The carrier request is suppressed; the real prompt still travels by request and its answer returns through the page-owned topic socket.

`AwtsmoosGPTify` presently defaults its user-facing chat method to the explicit fallback mode for compatibility. The raw relay API remains strict by default.

## Extension surface

The geelooy extension page bridge exposes:

```js
await awtsmoosFetch.directCapability();

await awtsmoosFetch.directChat({
	prompt,
	conversationKey,
	mode: "strict-request-only"
});

await awtsmoosFetch.directChat({
	prompt,
	conversationKey,
	mode: "page-authorized-fallback"
});
```

The extension route itself is request/message based:

1. Page bridge message.
2. Extension background request.
3. Local relay HTTP request.
4. Strict request-only capability service or explicitly selected fallback.

The exact local HTTP boundary used by the extension was tested live on a temporary relay port:

- `GET /direct-capability` returned HTTP 200.
- strict `POST /direct-chat` returned HTTP 409.
- both responses reported `conversationPostSent: false` for the strict capability path.

The unpacked extension did not activate in the tested Chrome profile despite the `--load-extension` flag: no extension service-worker target appeared and no page bridge was installed. Therefore the source, package closure, and exact HTTP boundary are verified, but a live call from `window.awtsmoosFetch.directCapability()` was not observed in that profile.

## Start the relay

```bash
AWTSMOOS_SPLIT_BROWSER_PORT=38488 \
AWTSMOOS_CHROME_DEBUG_PORT=9226 \
AWTSMOOS_DIRECT_INTERVAL_MS=7000 \
node geelooy/ai/relay/split-browser/index.js
```

## Verification

Static and package tests:

```bash
node --test \
	geelooy/ai/tests/directRelayService.test.mjs \
	geelooy/ai/tests/directTransportSource.test.cjs \
	geelooy/ai/tests/extensionZipPackage.test.cjs
```

Live production capability:

```bash
AWTSMOOS_CHROME_DEBUG_PORT=9226 \
node geelooy/ai/tests/liveRequestOnlyCapability.mjs
```

Important reports:

- `geelooy/ai/thoughts/live-request-only-capability.json`
- `debugging/chatgpt-endpoint-recovery-2026-07-22/evidence/reports/nonmain-route-request-probe-9226.json`
- `debugging/chatgpt-endpoint-recovery-2026-07-22/evidence/reports/nonmain-route-request-probe-headless-9333.json`
- `debugging/chatgpt-endpoint-recovery-2026-07-22/evidence/reports/request-only-prepare-live.json`
- `debugging/chatgpt-endpoint-recovery-2026-07-22/evidence/reports/request-only-sentinel-capability.json`
- `debugging/chatgpt-endpoint-recovery-2026-07-22/evidence/reports/geelooy-extension-http-boundary-summary-final.json`

No report retains bearer tokens, conduit values, Sentinel prepare tokens, proof values, Turnstile values, socket verification URLs, account identifiers, or upstream conversation identifiers.
