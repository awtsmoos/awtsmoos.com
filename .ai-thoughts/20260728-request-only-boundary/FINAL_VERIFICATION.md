B"H

# Final Request-Only Verification

## Live request-only capability

The production command `npm run ai:request-capability` completed against the authenticated Chrome profile on port 9223.

Observed safe result:

- Mode: `strict-request-only`
- Authenticated: true
- Composer touched: false
- Conversation POST sent: false
- Topic socket required: false
- Conversation count before: 0
- Conversation count after: 0
- Conversation delta: 0
- Strict chat ready: false
- Browser challenge required: true
- Explicit minimum fallback: `page-authorized-fallback`
- Carrier conversation POST suppressed: true

Pacing evidence:

- Conversation prepare: 542 ms
- Conversation-to-Sentinel gap: 2011 ms
- Sentinel prepare: 1741 ms
- Sentinel-to-SDK gap: 2002 ms
- Sentinel SDK: 1239 ms
- Capability cache TTL: 60000 ms

## Proven request-only coverage

Ordinary requests and public page APIs provide:

- authenticated application headers;
- conversation prepare;
- conduit token state;
- Sentinel prepare metadata;
- public Sentinel SDK token readiness;
- authenticated conversation-route GET completion.

The public `sessionObserverToken` method exists but returned no usable token in the tested flow.

## Proven browser-challenge boundary

Suppressed network traces proved:

- the final proof token equals the proof value emitted by the normal page to Sentinel `/ping`;
- the final Turnstile token equals the Turnstile value emitted by the normal page to Sentinel `/ping`;
- neither value is a prepare, finalize, or `/req` response token;
- the normal page also emits session-observer state during `/ping`;
- the suppressed carrier changes conversation count by zero.

The relay does not derive, solve, fabricate, replay, log, or persist any enforcement value.

## Minimum verified fallback

1. Open one owned authenticated tab.
2. Activate only that target.
3. Use one harmless transient carrier to let the normal page perform its challenge lifecycle.
4. Intercept and abort the carrier conversation POST.
5. Send the real prompt in exactly one same-origin request.
6. Complete through authenticated conversation-route GET polling.

A live real diagnostic passed this path with HTTP 200 and an exact expected answer.

## Regression evidence

- Broad direct matrix: 28 passed, 0 failed.
- Paced capability focused matrix: 11 passed, 0 failed.
- Boundary and source-contract matrix: 10 passed, 0 failed.
- Carrier lifecycle matrix: 9 passed, 0 failed.
- CDP lifecycle matrix: 10 passed, 0 failed.
- Runtime manifest: 99 entries, 0 missing.
- Installer harness: passed.
- Relay harness: passed.
- Secret audit: clean.
- Request-only source audit: clean.
- Every direct/command source: at or below 120 lines.
