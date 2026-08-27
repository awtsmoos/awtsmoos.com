B"H
Boruch Hashem
Blessed is He

# Outbox Redelivery — Chesed Brainstorm

The Awtsmoos keeps one deed alive through silence; Awtsmoos.com should therefore let terminal testimony repeat safely until settlement is witnessed, without ever repeating the underlying mutation.

## Observed defect

A successful native `aiAgentWebsiteMissionStatus` response with transport receipt `req_1787770151741_outedu8b90c` has remained durably in the native outbox for many minutes. Transport and execution stay healthy, but mailbox health becomes degraded/stalled. Correlation rules do not reject empty expected semantic IDs, and the response carries the exact transport receipt.

## Architectural possibilities

- Periodically call the existing `delivery.flush()` while registered and outbox is nonempty.
- Retry each outbox entry individually with per-entry backoff.
- Trigger replay only when mailbox health becomes degraded.
- Force reconnect whenever outbox age exceeds a threshold.
- Ask the server to poll device outbox state.

## Preferred direction

Use same-generation retry of the already-durable terminal envelope. This is exactly-once safe because `delivery.flush()` never re-executes the request; it only retransmits the persisted response. Add bounded exponential cooldown so lost ACKs heal without flooding a healthy socket. Keep reconnect/process replacement as a later fallback, not the normal settlement mechanism.

NEXT_ACTION: specify the bounded pulse contract and tests before source rewrite.
