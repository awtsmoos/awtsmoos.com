B"H
Boruch Hashem
Blessed is He

# Geelooy Direct AI Relay

The default transport is now fully request-only:

- `strict-request-only` — native server-side HTTP to the official OpenAI Responses API.
- `official-api-request-only` — explicit name for the same zero-browser transport.
- `page-authorized-fallback` — explicit legacy ChatGPT website fallback when website-sidebar conversations are specifically required.

Strict mode never opens Chrome, inspects a page, queries the DOM, types, clicks, installs a WebSocket shim, or reads browser cookies. When the official API credential is missing, strict mode fails immediately with `official_api_key_required` before any browser work.

## Configure the request-only transport

Create an API key in the OpenAI developer platform and export it in the relay server's shell:

```bash
export OPENAI_API_KEY="your_api_key_here"
export OPENAI_MODEL="gpt-5.2"
```

Keep the key in the server environment or a server-side key-management service. Never put it in browser JavaScript, commit it to the repository, paste it into a chat message, or include it in relay payloads.

Check configuration without contacting Chrome or the model API:

```bash
npm run ai:request-capability
```

Run four request-only conversation chains with five messages each:

```bash
npm run ai:request-only-stress
```

The stress runner:

1. Creates four independent Responses API chains.
2. Advances each chain through `previous_response_id`.
3. Sends exactly twenty native HTTP requests.
4. Enforces one global minimum ten-second request-start gap.
5. Keeps provider response IDs behind opaque local `BH_DIRECT_...` keys.
6. Stores no prompts, answers, credentials, or provider IDs in its report.
7. Records `browserUsed: false` and `domUsed: false`.

These are API conversation chains. They do not create entries in the ChatGPT website sidebar.

## Browser-free relay behavior

`POST /direct-chat` defaults to:

```json
{
	"mode": "strict-request-only"
}
```

Optional request fields:

```json
{
	"prompt": "Your prompt",
	"conversationKey": null,
	"mode": "strict-request-only",
	"model": "gpt-5.2",
	"thinkingEffort": "low"
}
```

The browser caller can send only prompt text, an opaque local continuation key, an explicit mode, model, reasoning effort, and the legacy website-only conversation mode. The API key remains server-side.

The official Responses API result is reduced to:

- answer text;
- opaque local conversation key;
- created/continued state;
- HTTP completion state;
- safe model and token-count metadata;
- pacing and latency facts.

Raw provider payloads, response IDs, authorization headers, account data, and hidden reasoning are not returned.

## Capability routes

- `GET /direct-health`
- `GET /direct-capability`
- `POST /direct-chat`
- `POST /direct-reset`

`GET /direct-capability` is configuration-only. It does not open Chrome or contact OpenAI. It reports whether `OPENAI_API_KEY` exists without revealing its value.

## Separate website diagnostic

The old ChatGPT website analysis remains available only as a separate diagnostic:

```bash
npm run ai:web-capability
```

That command opens an authenticated `/settings` host and safely reports the website's enforcement boundary. It never sends a conversation POST.

Suppressed traces established that the website's final proof and Turnstile values are outputs of its normal browser challenge lifecycle. They are not ordinary prepare/finalize response values. The project does not derive, solve, fabricate, replay, or bypass those protections.

## Explicit website fallback

When a ChatGPT website-sidebar conversation is specifically required, select:

```json
{
	"prompt": "Your prompt",
	"mode": "page-authorized-fallback"
}
```

The minimum fallback uses one owned authenticated tab, one harmless suppressed carrier, one real same-origin request, and authenticated GET completion. The user's real prompt never enters the composer. This fallback is intentionally not automatic.

## Commands

```bash
npm run ai:request-capability
npm run ai:request-only-stress
npm run ai:web-capability
npm run ai:login
npm run ai:fallback-stress
```

## Safety contracts

- Official API mode contains no browser or DOM imports.
- Missing API credentials fail before browser inspection.
- Browser callers never receive or submit the API key.
- Provider continuation IDs stay inside an in-memory local store.
- Real stress requests use a global minimum ten-second start gap.
- Public errors never include provider bodies, credentials, or stacks.
- Every direct-relay source file is limited to 120 lines.
