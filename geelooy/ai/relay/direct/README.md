B"H
Boruch Hashem
Blessed is He

# Geelooy Direct ChatGPT Relay

The relay separates two explicit transports:

- `strict-request-only` — capability truth and refusal when browser enforcement is required.
- `page-authorized-fallback` — the minimum normal-browser carrier needed to obtain fresh enforcement values, followed by request-driven chat and GET polling.

It never fabricates, derives, logs, stores, or replays proof, Turnstile, session-observer, conduit, account, session, or upstream conversation values.

## Request-only capability

The strict capability path uses an authenticated `/settings` tab. It does not focus, type into, click, or submit the composer. It does not install a WebSocket shim.

Official probes run sequentially:

1. Observe ordinary application headers in transient memory.
2. POST `/backend-api/f/conversation/prepare`.
3. Wait two seconds.
4. POST `/backend-api/sentinel/chat-requirements/prepare`.
5. Wait two seconds.
6. Load the public Sentinel SDK and invoke its public methods.
7. Cache the redacted capability result for 60 seconds.

The request-only surface provides:

- authenticated application headers;
- conversation preparation;
- conduit state;
- Sentinel preparation metadata;
- public Sentinel SDK readiness;
- authenticated conversation-route GET completion.

The live environment currently requires:

- Turnstile;
- proof of work;
- session-observer enforcement.

The public `sessionObserverToken` method exists but did not return a usable token in the tested flow.

## Proven browser-challenge boundary

Suppressed normal-page traces established the exact boundary:

1. The page calls Sentinel prepare.
2. Cloudflare's normal challenge runtime performs its verification.
3. The page calls Sentinel finalize, `/req`, and `/ping`.
4. The proof and Turnstile values used by the conversation request exactly match the values sent by the normal page to Sentinel `/ping`.
5. Those values do not match prepare, finalize, or `/req` response tokens.

Therefore active enforcement cannot currently be completed with ordinary requests alone. This project does not implement challenge solvers, proof derivation, token fabrication, or anti-abuse bypasses.

## Minimum fallback

When `page-authorized-fallback` is selected explicitly:

1. Open one owned authenticated tab.
2. Activate only that owned target.
3. Click the visible composer once to obtain normal user activation.
4. Insert a harmless transient carrier—not the user's prompt.
5. Wait until ChatGPT reports an enabled Send control.
6. Intercept the carrier conversation POST and abort it before delivery.
7. Reuse the fresh normal-page enforcement envelope for exactly one same-origin conversation POST containing the real prompt.
8. Poll the authenticated conversation route with GET requests until completion.
9. Close or safely reuse the bounded owned host.

The user's actual prompt never enters the composer. The carrier request is suppressed. Only the real request is delivered.

Live verification proved:

- suppressed carrier conversation-count delta: `0`;
- one real diagnostic conversation created successfully;
- exact expected answer matched;
- answer completion used authenticated GET polling;
- no topic WebSocket was required for completion.

## Relay routes

- `GET /direct-health`
- `GET /direct-capability`
- `POST /direct-chat`
- `POST /direct-reset`

`POST /direct-chat` defaults to:

```json
{
	"mode": "strict-request-only"
}
```

When active enforcement is required, strict mode returns HTTP 409 with `direct_enforcement_required`. It does not construct the carrier path or send a conversation POST.

Explicit fallback:

```json
{
	"prompt": "Your prompt",
	"mode": "page-authorized-fallback"
}
```

## Commands

Manual authentication:

```bash
npm run ai:login
```

Live request-only capability report, with no composer and no conversation POST:

```bash
npm run ai:request-capability
```

Login plus strict stress verification:

```bash
npm run ai:login-stress
```

Start the relay directly:

```bash
AWTSMOOS_SPLIT_BROWSER_PORT=38488 \
AWTSMOOS_CHROME_DEBUG_PORT=9223 \
AWTSMOOS_DIRECT_INTERVAL_MS=10000 \
node geelooy/ai/relay/split-browser/index.js
```

## Safety and pacing

- Capability probes are sequential with two-second gaps.
- Capability results are cached for 60 seconds.
- Real stress requests use a global minimum ten-second start gap.
- Carrier POSTs are always intercepted and suppressed.
- No report includes token values, cookie values, authorization values, account identifiers, session identifiers, upstream conversation identifiers, prompts, or answers.
- Every direct-relay source file is limited to 120 lines.
