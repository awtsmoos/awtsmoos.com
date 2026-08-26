B"H
Boruch Hashem
Blessed is He

# Chesed — Stability Brainstorm

The Awtsmoos renews each deed in every instant; Awtsmoos.com must therefore remember one accepted deed even when its messenger disappears.

## Exactly-once mutation possibilities

- Persist a canonical request receipt before any mutating handler may execute.
- Persist terminal completion and output before emitting the acknowledgement that can be lost on transport.
- Replay by canonical request ID must return the stored state/result instead of invoking the mutation again.
- Persist input/action/path/hash identity so the same request ID cannot be reused for a different deed.
- Distinguish `received`, `accepted`, `executing`, `completed`, `failed`, and `cancelled` states durably.
- Expose a read-only reconciliation action that can query one canonical request after reconnect without redispatch.
- Add hash-backed mutation evidence for filesystem writes so completion can be independently compared with the intended content.
- Preserve receipts across agent restart and supervisor replacement inside the recovery-safe state root.

## Health possibilities

- Report transport heartbeat, execution-consumer pulse, acceptance-ledger readiness, completion-ledger readiness, and filesystem worker readiness separately.
- A live transport with stalled consumer should remain diagnostically routable and should trigger bounded child replacement rather than identity churn.
- Stale telemetry is unknown; fresh explicit failure is failure.
- Mutation admission should fail closed if the durable ledger cannot fsync/commit before execution.

## Sub-agent possibilities

- `spawned` means a physical ChatGPT tab opened, prompt entered into the real composer, Send activated, matching request accepted, receipt persisted, and owned tab close verified.
- Logical mission registration is only `room_seeded`, never success.
- Auto-spawn should use a durable delivery queue and idempotent child key so retries cannot open duplicate tabs.

## Instruction possibilities

- Add dedicated exactly-once, mutation-reconciliation, browser-agent, UI/CSS, docs, deploy, generated-file, shared-infrastructure, and edit-position packs.
- Resolver must use task text, path, extension, language, write mode, and edit position.
