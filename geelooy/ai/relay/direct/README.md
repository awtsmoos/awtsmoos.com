B"H
Boruch Hashem
Blessed is He

# Geelooy Authenticated Direct ChatGPT Relay

The Awtsmoos recreates every browser session, authorized request envelope, stream handoff, topic frame, and answer. This module tree replaces geelooy AI's obsolete `/backend-api/conversation` sender with the current authenticated ChatGPT web transport while keeping credentials and upstream identifiers inside the local relay.

## Public relay routes

- `GET /direct-health`
- `POST /direct-chat`
- `POST /direct-reset`

A creation request contains only a prompt. A continuation adds an opaque local `BH_DIRECT_...` key. The relay never returns the upstream ChatGPT conversation ID, assistant message ID, bearer token, cookie, account ID, proof value, turnstile value, session value, topic ID, or WebSocket verification URL.

## Current transport stages

1. Discover a live authenticated ChatGPT debug page.
2. Create a fresh root controller tab and retain the page-owned topic socket before application startup.
3. Use a bounded carrier interaction only because current conversation preparation requires application-generated, page-managed proof and turnstile values.
4. Intercept and suppress every carrier conversation POST.
5. Mutate only the real prompt and continuation linkage in transient relay memory.
6. Apply the global request pacer immediately before the real POST.
7. Send the real request with same-origin page-context `fetch`.
8. Parse the SSE stream handoff.
9. Subscribe to the topic on the page-owned socket.
10. Reduce v1 add, append, patch, and terminal-marker items into answer and continuation state.
11. Store continuation state behind an opaque local key.

## Headless boundary

A persisted authenticated profile was launched with Chrome `--headless=new`. ChatGPT presented a normal Cloudflare `Just a moment...` challenge. Session, conversation-prepare, and sentinel-prepare requests returned 403 HTML and the challenge did not clear naturally. The relay does not bypass that challenge.

The validated production mode is therefore a normal debug Chrome controller. Real prompts and answers use request and topic transports only. DOM is used solely for the suppressed carrier bootstrap because the current page-generated authorization envelope cannot be reproduced safely by request-only code.

## Configuration

```bash
AWTSMOOS_SPLIT_BROWSER_PORT=38488 \
AWTSMOOS_CHROME_DEBUG_PORT=9226 \
AWTSMOOS_DIRECT_INTERVAL_MS=7000 \
node geelooy/ai/relay/split-browser/index.js
```

The relay checks the configured debug port first, then known local ports including `9226`, `9223`, `9222`, and `9224`.

## Browser and extension integration

`geelooy/ai/AwtsmoosGPTify.js` sends prompt text and opaque local keys through `js/chatgpt/direct/directRelay.js`.

The extension exposes:

```js
await awtsmoosFetch.directChat({ prompt, conversationKey });
await awtsmoosFetch.resetDirectChat({ conversationKey });
```

The extension background forwards those safe packets to the local relay. Every split bridge helper is included in the downloadable extension ZIP.

## Verification

```bash
node --test \
	geelooy/ai/tests/directRelayService.test.mjs \
	geelooy/ai/tests/directTransportSource.test.cjs \
	geelooy/ai/tests/extensionZipPackage.test.cjs
```

Live production verification uses three conversations with one creation plus five continuations each:

```bash
node geelooy/ai/tests/liveDirectRelayStress.mjs
```

The live report retains no opaque keys or upstream identifiers. Transport success and exact wording compliance are reported separately.
