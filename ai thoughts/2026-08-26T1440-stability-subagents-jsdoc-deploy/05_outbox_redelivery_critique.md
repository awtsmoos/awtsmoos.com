B"H
Boruch Hashem
Blessed is He

# Outbox Redelivery — Gevurah Critique

The Awtsmoos gives repetition a boundary: Awtsmoos.com may repeat terminal testimony, but must never let repetition become duplicate execution or socket flooding.

## Risks to defeat

1. Calling `flush()` every 500 ms would waste bandwidth and repeatedly exercise server reconciliation.
2. Retrying while unregistered would create meaningless send attempts.
3. Replaying the inbox would be unsafe; only persisted outbox terminal envelopes may repeat.
4. Multiple overlapping flush drains could race; existing `outboxReplayScheduled` must remain the serialization authority.
5. A permanent server quarantine must not become a tight retry loop.
6. Backoff state must reset once outbox drains so future lost ACKs receive prompt repair.
7. The pulse must expose testimony so future diagnostics can distinguish first send, retry, cooldown, and empty state.
8. The cycle file must remain focused and below 120 lines; retry timing belongs in a dedicated module.
9. Complete JSDoc must not be shortened to fit the limit; split modules instead.
10. Tests must prove no action re-execution primitive is called—only `delivery.flush()`.

## Chosen bounds

- First retry after 2 seconds of nonempty outbox.
- Exponential cooldown: 2s, 4s, 8s, 16s, capped at 30s.
- Reset attempt/backoff state when outbox becomes empty or registration is lost.
- Existing `delivery.flush()` remains the only transport operation.

NEXT_ACTION: write final file plan, then implement pulse + runtime-cycle integration as whole files.
