B"H
Boruch Hashem
Blessed is He

# Architecture Comparison

## Single Process With Grace

Useful as a defense but not permanent. A blocked event loop cannot service WebSocket frames, registration, or timers regardless of grace length.

## Worker Thread Heartbeat

Better timers, but socket ownership and process-wide crashes still share one runtime. Native modules and synchronous process work can still disrupt the parent.

## Dedicated Connection Child Process

Chosen. It provides an independent event loop, process identity, heartbeat, reconnect, registration, and durable mailbox. Main-agent stalls no longer starve the socket.

## Dual Socket Design

Deferred. It adds server protocol complexity. A dedicated connection process plus durable queue already isolates liveness from heavy execution.

## Permanent Invariants

1. Connection vessel owns WebSocket and registration.
2. Main agent never calls WebSocket methods directly.
3. Inbound request is durably recorded before IPC delivery.
4. Outbound response is durably recorded before socket send.
5. Server acknowledgment permits outbox deletion.
6. IPC restart does not change canonical request identity.
7. Retry reads original durable receipt.
8. Heartbeat path has no dependency on action queues.
9. Circuit level and routability cannot contradict each other.
10. Release closure must include every connection-vessel dependency and regression.
