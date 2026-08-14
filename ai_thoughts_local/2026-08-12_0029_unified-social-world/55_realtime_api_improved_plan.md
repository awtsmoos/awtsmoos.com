B"H

Boruch Hashem

Blessed is He

# Shared Realtime/API Improved Plan

The Awtsmoos is beyond correlation and policy. After tracing browser callers and the server platform, the right improvement is not a new API vocabulary; it is a stricter browser mirror of the vocabulary the server already speaks.

## Revelations from the server platform

1. `ProtocolEnvelope.js` already defines the canonical protocol name.
2. Server responses include protocol/application/version/type/payload/serverTime.
3. Correlated responses additionally echo requestId and sequence.
4. Events are intentionally uncorrelated.
5. Parsing failures may produce error envelopes with null requestId/sequence.
6. `RealtimeError` already carries code/details/status.
7. `VersionedRouting` safely converts unknown failures to bounded INTERNAL_ERROR responses.
8. Server duplicate request IDs are replay-safe through `ClientRequestState`.
9. Browser `createRealtimeError` currently discards details/status.
10. Browser pending timeout/close errors are less structured than server application errors.

## Improvements over brainstorm

1. Keep the server platform untouched in this pass.
2. Keep the 65s default timeout unchanged.
3. Add optional timeout policy plumbing now, not per-operation guesses.
4. Define one browser error owner rather than constructing ad-hoc Errors in connection/pending files.
5. Preserve server `details` and `status` in `createRealtimeError`.
6. Add a separate inbound-envelope validator because server inbound-request validation cannot be reused for outbound events with camelCase event types.
7. Validator accepts a bounded string type rather than the server request TYPE_PATTERN.
8. Validator treats requestId/sequence as optional correlation fields, but if present they must be valid.
9. Validator permits null requestId/sequence only for `type:error` parsing failures.
10. Validator requires payload object, never array.
11. Validator requires protocol/application/version/type; serverTime is optional for cautious compatibility but validated if present.
12. `SiteRealtimeSocket.receive()` parses JSON, validates envelope, then settles/emits.
13. Malformed inbound messages are ignored and emit a local `invalid-envelope` diagnostic event with no raw payload.
14. Pending ledger stores application/version/type/sequence alongside callbacks.
15. `settle()` checks application/version/sequence before resolving a matching requestId.
16. A mismatched correlation rejects that pending request with `REALTIME_RESPONSE_MISMATCH` rather than allowing a later timeout.
17. Timeout error details include only metadata, never request payload.
18. Close rejection uses `REALTIME_CONNECTION_CLOSED`.
19. `RealtimeConnection.connect()` uses `REALTIME_CONNECTION_OPEN_FAILED`.
20. `RealtimeConnection.send()` validates OPEN state and throws `REALTIME_SOCKET_NOT_OPEN`.
21. Optional request policy shape is `{timeoutMs}` only in this pass.
22. Normalize timeout to a safe finite range, e.g. 1000..120000ms, with default 65000.
23. No AbortSignal/cancellation yet; WebSocket request cancellation has no server cancellation protocol today.
24. No automatic retry.
25. No reconnect-delay change.
26. No sequence/requestId shape change.
27. Application adapters accept `request(type,payload={},options={})`.
28. Existing callers remain source-compatible.
29. Public/private adapters simply pass options; no per-operation policy introduced yet.
30. A future operation policy can be added without reopening the shared transport signature.

## New files

- `RealtimeBrowserError.js` — stable transport/client error factory.
- `RealtimeInboundEnvelope.js` — versioned server-envelope validation.
- `RealtimeRequestPolicy.js` — default/normalized timeout policy.
- `realtimeRequestContract.test.mjs` — timeout, close, mismatch, server-error metadata, malformed inbound, valid event routing.

## Existing files to rewrite

- `realtimeEnvelope.js` — preserve server details/status and use browser error owner.
- `RealtimePendingRequests.js` — metadata-aware pending ledger and policy timeout.
- `RealtimeConnection.js` — structured open/send/close behavior.
- `SiteRealtimeSocket.js` — options plumbing + inbound validation/diagnostic event.
- `ApplicationRealtimeClient.js` — optional request options.
- `RealtimePrivateMessagingSocket.js` — optional request options passthrough.
- `RealtimeUniversalChatSocket.js` — optional request options passthrough.

## Tests

Focused:
- existing `realtimeLifecycle.test.mjs`
- new realtime request contract test
- browser import closure

Security/regression:
- private consent
- private group
- request dedup
- Public security
- source search timeout
- Public persistence/history tests

## NEXT_ACTION

Write the final execution contract with exact error codes, validator rules, timeout bounds, and test cases; then implement browser-only transport hardening via full-file rewrites.
