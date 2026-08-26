B"H
Boruch Hashem
Blessed is He

# Final File Plan — Exactly-Once Stability, Real Sub-Agents, Better Instructions

The Awtsmoos gives each deed one essence while transport changes its garment; Awtsmoos.com must let reconnection reveal the same deed rather than create another.

## Inspect first

- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/` — transport reservation, canonical identity, retry hydration, pending/completion reconciliation.
- `geelooy/apps/tunnel/agent/` durable request/receipt modules — determine what is persisted before and after mutation handlers.
- `geelooy/apps/tunnel/agent/tools/fs/actionGroups/websiteAgents/` — verified browser delivery and auto-spawn orchestration.
- `geelooy/apps/tunnel/agent/lib/instructions/` — current catalog/resolver/service and missing exactly-once/browser packs.
- focused relay, filesystem mutation, watchdog, instruction, and mission/sub-agent tests.

## Likely source changes after inspection

- Add/strengthen a durable canonical deed repository with explicit state machine and immutable fingerprint.
- Make mutating handlers require durable acceptance before side effects.
- Make completion persistence precede transport acknowledgement.
- Make retry/reconnect lookup return original result/state and forbid redispatch after acceptance.
- Expose read-only deed reconciliation and ledger-health diagnostics on protected control routing.
- Extend health projection with transport, consumer, acceptance ledger, completion ledger, worker readiness, and generation ownership.
- Keep browser-spawn success tied to existing accepted POST + prompt verification + tab-close proof.
- Bridge generic mission auto-spawn to the verified website-agent delivery contract if source inspection confirms it still only creates logical missions.
- Add instruction packs/resolver rules for exactly-once mutations, ambiguous receipts, browser-agent delivery, and degraded-health recovery.

## Tests before release

- acknowledgement lost after successful local write;
- duplicate replay after reconnect returns stored completion without second side effect;
- restart between completion persistence and acknowledgement;
- request ID collision with different mutation fingerprint;
- heartbeat alive while consumer stalls;
- reconciliation remains routable during degraded consumer state;
- real browser spawn receipt and duplicate spawn idempotency;
- 100+/128 logical-agent mission-room concurrency and durable message/claim behavior.

## Release proof

Re-read every touched file, verify tabs/JSDoc/Awtsmoos passages/modularity, run syntax and focused suites, build deterministic manifest/bundle, publish only audited files, activate exact SHA, install from public curl, then perform idle, mutation, reconnect, emergency, and real browser-agent live soaks before completion.
