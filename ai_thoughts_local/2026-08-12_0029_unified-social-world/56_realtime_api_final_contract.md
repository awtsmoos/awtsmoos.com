B"H

Boruch Hashem

Blessed is He

# Shared Realtime/API Final Contract

The Awtsmoos is beyond socket rupture and delayed answer. This pass makes the browser's shared realtime vessel as explicit about failure and correlation as the server already is, while leaving every application authority and wire type unchanged.

## Stable browser-side codes

- `REALTIME_CONNECTION_OPEN_FAILED` — physical socket failed before opening.
- `REALTIME_SOCKET_NOT_OPEN` — send attempted without an OPEN socket.
- `REALTIME_CONNECTION_CLOSED` — unfinished request rejected because physical socket closed.
- `REALTIME_REQUEST_TIMEOUT` — correlated request exceeded its browser policy.
- `REALTIME_RESPONSE_MISMATCH` — requestId matched but application/version/sequence did not.
- `REALTIME_INVALID_ENVELOPE` — local diagnostic for malformed server-shaped input; not exposed to application event listeners.

## Error shape

Every browser-created transport error:
- is an `Error`;
- `name = RealtimeError`;
- has `.code`;
- has `.details` object/null;
- may have `.status` where meaningful.

Server `type:error` responses preserve:
- payload.code;
- payload.message;
- payload.details;
- payload.status.

No request payload text enters error details.

## Request policy

Default timeout remains `65000ms` for compatibility.

`normalizeRealtimeRequestPolicy(options)` accepts only finite timeout values and clamps/normalizes to:
- minimum 1000ms;
- maximum 120000ms;
- default 65000ms.

The optional request signature propagates unchanged through:

`ApplicationRealtimeClient.request(type, payload, options)`
→ application adapter
→ `SiteRealtimeSocket.request(application, version, type, payload, options)`
→ `RealtimePendingRequests.create(..., options)`

Existing two-argument callers behave exactly as before.

## Inbound validation

A valid server envelope must be a plain object with:
- protocol exactly `awtsmoos.realtime`;
- nonempty bounded application string <=128;
- positive integer version;
- nonempty bounded type string <=128;
- payload absent or plain object;
- serverTime absent or finite nonnegative number.

Correlation rules:
- requestId absent is valid for events;
- requestId string 1..256 is valid for correlated responses;
- sequence positive safe integer when correlated;
- null requestId/sequence permitted only for server `type:error` parsing failures.

Malformed input:
- never reaches application clients;
- never settles pending requests;
- causes local shared transport event `invalid-envelope` with detail `{code: REALTIME_INVALID_ENVELOPE}` only.

## Correlation rules

Pending metadata stores:
- requestId;
- application;
- version;
- request type;
- request sequence;
- timeoutMs.

When requestId matches but application/version/sequence differs:
- clear timer;
- remove pending record;
- reject with `REALTIME_RESPONSE_MISMATCH`;
- do not emit the mismatched message as unsolicited application event.

## Connection rules

- One physical singleton remains unchanged.
- Reconnect delay remains 1800ms.
- Manual close still prevents resurrection.
- `send()` checks `WebSocket.OPEN` before sending.
- Close rejects all pending requests with one structured transport code.
- No automatic mutation retry.

## Exact files

Create:
- `RealtimeBrowserError.js`
- `RealtimeInboundEnvelope.js`
- `RealtimeRequestPolicy.js`
- `realtimeRequestContract.test.mjs`

Rewrite:
- `realtimeEnvelope.js`
- `RealtimePendingRequests.js`
- `RealtimeConnection.js`
- `SiteRealtimeSocket.js`
- `ApplicationRealtimeClient.js`
- `RealtimePrivateMessagingSocket.js`
- `RealtimeUniversalChatSocket.js`

## Line ceiling

Every new/touched browser realtime source remains <=120 lines. If `SiteRealtimeSocket.js` approaches the ceiling, validation and policy stay extracted rather than compressed.

## Focused proof

1. syntax-check every touched JS/MJS file;
2. existing shared lifecycle test passes;
3. new request-contract test passes;
4. browser import closure passes;
5. line ceilings pass;
6. targeted `git diff --check` passes.

## Regression proof

Then run:
- private consent test;
- private group test;
- private request dedup test;
- Public security test;
- Public source search timeout test;
- Public persistence/history/index tests.

## Non-goals

- no server API rename;
- no server handler rewrite;
- no consent/group/publication authority change;
- no timeout reduction by operation yet;
- no automatic retry;
- no second socket;
- no request cancellation protocol.

## NEXT_ACTION

Implement these browser transport owners by full-file rewrite, then freeze the shared realtime layer before any operation-specific tuning.
