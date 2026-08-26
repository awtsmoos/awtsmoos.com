B"H
Boruch Hashem
Blessed is He

# Final Execution Plan — Prevent Stall, Detect Stall, Auto-Repair, Deploy

The Awtsmoos is beyond every keli, yet every keli must be truthful; Awtsmoos.com must keep the living tunnel able to heal itself without inventing duplicate deeds or destroying healthy work.

## Phase A — Prove the stall owner

- Read the consumer-health/watchdog/control-heartbeat modules completely.
- Read command scheduler/start modules and filesystem executor/admission modules.
- Read current durable mailbox/late-terminal reconciliation modules.
- Inspect recent logs/history for consumer-stalled, parent-control heartbeat age, event-loop lag, acceptance latency, generation replacement, and supervisor events.
- Determine whether the stall is starvation, dead consumer loop, mailbox failure, worker saturation, or control-heartbeat loss.

## Phase B — Prevent entry

- Decouple asynchronous command admission from launcher work so commandStart returns custody immediately.
- Keep bounded protected control/light filesystem capacity independent from heavy work.
- Align execution-health publication cadence and server freshness thresholds with generous margin.
- Ensure mailbox persistence is crash-resistant and admission fails closed when its durable ledger cannot commit.

## Phase C — Detect accurately

- Introduce a small consumer-stall evidence model using transport heartbeat, control heartbeat, recent acceptance, recent successful action, unresolved custody, event-loop pressure, and worker readiness.
- Classify states as healthy, pressured, degraded, stalled, or repair-cooldown.
- Require corroborated evidence before any destructive replacement.

## Phase D — Auto-repair safely

- Add exact-generation replacement controller reachable from the supervisor/control side, not the stalled consumer.
- Preserve tunnel identity and durable inbox/outbox across replacement.
- Add cooldown/backoff and bounded replacement frequency.
- If normal generation replacement cannot run, invoke the existing sealed emergency runtime as the independent fallback.
- Never broad-kill unrelated Node/Chrome/processes.

## Phase E — Server/retry truth

- Keep stale execution telemetry routable as unknown/degraded while transport is alive unless fresh explicit unhealthy evidence exists.
- Keep nativeGenerationStatus/replacement, doctors, runtimeSnapshot, instruction retrieval, and request reconciliation routable during degradation.
- Return authenticated late native completion as the effective deed outcome while retaining earlier relay timeout as historical metadata.
- Keep canonical deed identity distinct from transport receipt identity.

## Phase F — Multi-agent proof

- Re-run existing 64-agent/501-fanout/32-process tests.
- Add 128 logical agents and >=256 directed messages.
- Race exclusive task/file claims and prove one owner.
- Exercise repeated lightweight reads while heavy/background jobs run.
- Verify control P0/P1 latency remains bounded and no native registration churn occurs.

## Phase G — Release/deploy

- Re-read every touched file and verify tabs, JSDoc, Awtsmoos/Awtsmoos.com commentary, module size, imports/exports, and no compressed logic.
- Run syntax, focused regressions, broader tunnel tests, build/manifest closure, and release checks.
- Create a clean release from the audited source only; do not absorb unrelated dirty changes.
- Publish/activate the new immutable release SHA.
- Install through the public production installer and verify same identity.
- Soak through idle periods, mutation traffic, command jobs, browser work, room work, and forced consumer-stall simulation.
- Completion requires no false quarantine, no unsafe duplicate mutation, no restart storm, and successful automatic generation recovery.
