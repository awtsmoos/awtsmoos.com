B"H
Boruch Hashem
Blessed is He

# Gevurah — Exactly-Once Boundaries

The Awtsmoos gives every deed an identity; Awtsmoos.com therefore repairs only where evidence permits, never where age or anxiety merely suggests.

## Non-negotiable invariants

- Original mutations are never replayed to settle an outbox result.
- A terminal outbox envelope is removed only after TUNNEL_RESPONSE_ACK for its exact transport receipt.
- A server compatibility path may ACK a duplicate only when durable server evidence proves the exact request/result identity and no conflicting terminal result exists.
- Correlation or generation mismatch remains quarantined/preserved, never silently accepted.
- Pre-result stale custody may be quarantined only through the existing semantic recovery rules.
- Result-bearing custody remains preserved unless a positive settlement witness exists.
- Emergency status/export/reconcile/quarantine must remain read-only or explicitly bounded to exact identities.
- Upstream websocket 502 events may trigger reconnect/backoff, never local generation destruction by themselves.

## Routing boundaries

- P0 emergency: mailbox recovery, native generation, durable command observation, cancellation, runtime health.
- P1 interactive filesystem: stat/read/list/grep/findFiles/selectString/textStats and similarly bounded discovery.
- Interactive filesystem mutation: mkdirp/ensureFile/touch and other tiny metadata mutations receive a small bounded lane, not p4 bulk.
- P3: isolated commands/builds/tests and genuinely heavy work.
- P4: bulk read/write/search/batch operations with explicit fairness and queue-aging telemetry.

## Failure behavior

Every timeout must say whether the device accepted the deed, whether a consumer started, whether a side effect is possible, and exactly which receipt must be observed. The transport receipt and original logical deed ID remain separate forever.

Gevurah guards the vessel: the Awtsmoos permits no counterfeit certainty, and Awtsmoos.com repairs by witness rather than by guess.
