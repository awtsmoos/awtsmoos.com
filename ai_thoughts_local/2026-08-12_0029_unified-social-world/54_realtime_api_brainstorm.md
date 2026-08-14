B"H

Boruch Hashem

Blessed is He

# Shared Realtime/API Brainstorm

The Awtsmoos is beyond request and response, socket and server, yet a finite browser must know whether silence means timeout, rupture, malformed light, or a named application refusal. This brainstorm surveys the shared realtime seam without changing private consent or Public Torah authority.

## Ground truth already inspected

- One `SiteRealtimeSocket` singleton owns one physical social WebSocket.
- Public Torah and private messaging both use `ApplicationRealtimeClient`.
- Server requests use versioned `awtsmoos.realtime` envelopes.
- Server success responses preserve application/version/requestId/sequence and add serverTime.
- Server application events omit request correlation but keep application/version/type/payload/serverTime.
- Server errors use `type: error` and payload `{code, details, message, status}`.
- Versioned server routing remembers responses for duplicate request IDs.
- Private message, consent, group, block, request, and alias authority already lives server-side.
- Public Torah search remains private and publication remains server-source-only.
- Browser pending requests currently use one hardcoded 65-second timeout.
- Browser timeout and connection-close failures are ordinary Errors with no stable code.
- Browser connection-open failure is also a generic Error.
- Browser `send()` assumes the socket is open.
- Browser receive parses JSON but emits any parsed unsolicited object without versioned-envelope validation.

## Possibilities

1. Add a browser transport-error factory with stable `code`, `details`, and optional `status`.
2. Preserve server error `details` and `status` on browser Errors.
3. Give timeout errors code `REALTIME_REQUEST_TIMEOUT`.
4. Include application, request type, requestId, and timeoutMs in timeout details.
5. Give physical close code `REALTIME_CONNECTION_CLOSED`.
6. Give open failure code `REALTIME_CONNECTION_OPEN_FAILED`.
7. Guard raw send with `REALTIME_SOCKET_NOT_OPEN`.
8. Add an optional `{timeoutMs}` request policy without changing the current default.
9. Keep default 65000ms for backwards compatibility.
10. Allow application adapters to choose explicit timeout policies later.
11. Avoid prematurely shortening private mutations without latency evidence.
12. Keep Public Torah search at existing 65s browser budget initially; server corpus lanes already cap at 30s each.
13. Validate inbound versioned envelopes before correlation or app dispatch.
14. Accept both correlated responses and uncorrelated events.
15. Accept parsing-failure error envelopes whose requestId/sequence may be null.
16. Require protocol exactly `awtsmoos.realtime`.
17. Require bounded nonempty application/type strings.
18. Require positive integer version.
19. Require payload to be a plain object when present.
20. Reject arrays/primitives as envelopes.
21. Ignore malformed inbound transport noise rather than exposing it to applications.
22. Consider dispatching a diagnostic event for malformed input without leaking it to apps.
23. Ensure a correlated response belongs to the application that created that requestId.
24. Ensure a correlated response version matches the pending request.
25. Consider sequence matching as another correlation guard.
26. Reject mismatched correlated envelopes as a protocol error rather than silently resolving the wrong promise.
27. Do not retry mutations automatically at the browser layer; server replay safety does not imply every caller wants transparent replay after ambiguous disconnect.
28. Keep reconnect lifecycle exactly one shared socket.
29. Avoid exponential backoff changes until real reconnect data justifies them.
30. Keep 1800ms reconnect delay unchanged in this pass.
31. Keep invalid JSON ignored unless diagnostics need it.
32. Consider one `realtime-invalid-envelope` EventTarget diagnostic event for observability.
33. Do not log private payload contents.
34. Do not add request payloads to error details.
35. Expose pending request count only for tests/diagnostics if needed, not product state.
36. Make tests use fake timers so timeout behavior is deterministic.
37. Add tests for server error status/details preservation.
38. Add tests for timeout code/details.
39. Add tests for close rejection code.
40. Add tests for socket-not-open send guard.
41. Add tests that malformed unsolicited JSON objects do not reach application clients.
42. Add tests that valid application events still reach only their application.
43. Add tests that correlated application mismatch does not resolve.
44. Preserve current requestId shape and crypto UUID.
45. Preserve sequence behavior.
46. Preserve server duplicate-request memory semantics.
47. Keep source files under 120 lines by splitting validation/errors/policy.
48. Keep adapter signatures backwards-compatible: third request argument optional.
49. Do not change server wire names or response types.
50. Rerun private consent/group/dedup and Public security/search timeout suites after browser transport changes.

## NEXT_ACTION

Convert these possibilities into a narrower file plan centered on browser transport correctness, with zero server authority changes and no timeout reductions until evidence supports them.
