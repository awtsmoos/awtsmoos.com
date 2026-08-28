B"H
Boruch Hashem
Blessed is He

# Tiferes — Thirty Improvements After Critique

The Awtsmoos joins Chesed and Gevurah so mercy has a measurable frame;
Awtsmoos.com must make recovery precise without hiding failure behind a name.

## Critique findings and improvements

1. A sealed-control label is insufficient; tests must prove sealed actions never enter ordinary consumer custody.
2. Sealed status/export must remain read-only even under corrupted mailbox state.
3. Quarantine must require exact record identity plus a durable reason code.
4. Reconciliation must distinguish original deed identity from relay transport receipt identity.
5. Recovery must preserve original logical-agent/session ownership for auditability.
6. A lease timeout cannot imply failure while a live worker or terminal witness exists.
7. A fresh terminal result must outrank an older accepted snapshot.
8. Generation mismatch alone cannot authorize replay of a mutation.
9. Generation replacement should trigger reconciliation, not silently discard unresolved evidence.
10. Live generations need the same reconciliation capability previously obtained only by replacement.
11. Every reaper pass needs a bounded item count and bounded wall-clock budget.
12. Reaper failures must not recursively block the control lane needed to inspect them.
13. Health should expose `transport_alive` directly instead of inferring it from composite health.
14. Health should expose `execution_consumer_alive` from fresh ingress/consumer evidence.
15. Health should expose `admission_alive` from recent admission progress independent of workers.
16. Health should expose `worker_alive` from worker heartbeats/process identity.
17. Health should expose `mailbox_custody_health` from age, generation, and custody witnesses.
18. Health should expose `completion_reconciliation_health` from terminal lag and unresolved terminal delivery.
19. Composite routeability must not become false only because mailbox telemetry is old while fresh execution succeeds.
20. Destructive recovery must perform a fresh preflight after maturity and immediately before signaling a process.
21. Preflight must abort if new execution or consumer progress appears during the decision window.
22. Pressure should defer destructive repair without indefinitely disabling non-destructive reconciliation.
23. Tiny interactive reads need reserved execution capacity, not merely a higher nominal lane limit.
24. `commandStart` admission must be separated from launched process lifetime.
25. Command status/output observers need reserved capacity so completed jobs remain observable under load.
26. Per-requester limits must coexist with global fairness to prevent noisy-neighbor starvation.
27. `agent_queue_wait_expired` after durable acceptance must become a reconciliation state, never a fresh-retry invitation for mutations.
28. Retry response validation must compare transport receipt to retry wrapper and original deed only to `originalControlRequestId` when present.
29. The stale ancient outbox record needs export/terminal-result inspection before any manual or automatic quarantine claim.
30. Automatic quarantine must be exactly-once safe across crash/restart during the quarantine write itself.
31. Quarantine storage needs durable provenance: record hash, generation, original action, reason, witness, timestamp.
32. Reconciliation should prefer replaying an already-persisted response envelope over re-running application code.
33. Late terminal server results must remain admissible after client-side queue timeout.
34. Compatibility fields must stay available while new health dimensions are introduced, to avoid breaking callers.
35. Telemetry counters should distinguish lifetime totals from current-generation/current-window counts.
36. Test fixtures must reproduce the observed `accepted_waiting_for_consumer` -> `agent_queue_wait_expired` path.
37. A regression must reproduce a stale outbox record while ordinary newer requests continue completing.
38. A regression must prove `connectionMailboxStatus` remains terminally observable under saturated ordinary lanes.
39. A regression must prove repeated reconciliation calls return the same outcome and never duplicate a mutation.
40. Release soak must inspect process lifecycle history, not merely current connection health.

## Revised architecture preference

Use a small sealed-control classifier/router plus a separate bounded mailbox reconciliation service. Keep health composition in dedicated small modules. Preserve current recovery/preflight modules and strengthen their evidence contract rather than merging everything into one watchdog. Repair retry correlation at the API response-contract layer where receipt semantics belong.

## Rejection criteria

Reject any design that:

- needs generation restart to clear stale custody;
- routes recovery status through ordinary consumer admission;
- treats queue expiry as safe mutation replay;
- equates mailbox stall with transport death;
- can signal SIGTERM from a mature but stale snapshot;
- hand-edits generated manifest/bundle data;
- overwrites concurrent working-tree changes.
