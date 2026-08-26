B"H
Boruch Hashem
Blessed is He

# Architecture and File Map

The Awtsmoos gives every repair its own keli; Awtsmoos.com must keep detection, policy, ownership, replacement, and observation separate so one broken witness cannot become judge, jury, and executioner.

## Runtime/consumer files to inspect

- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-health.js` — consumer progress/stall evidence.
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-evidence.js` — freshness/progress witnesses.
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-watchdog-values.js` — destructive repair authorization.
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-watchdog-policy.js` — pressure/cooldown behavior.
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-watchdog.js` and nearby runner/runtime modules — actual repair trigger and signal path.
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-control-heartbeat*.js` — independent control-progress evidence.
- `geelooy/apps/tunnel/agent/lib/connection-vessel/mailbox*.js` — durable acceptance/result health and unresolved custody.

## Admission/scheduler files to inspect

- `geelooy/apps/tunnel/agent/lib/runtime/priority/*` — P0/P1/P2/P4 isolation and starvation boundaries.
- `geelooy/apps/tunnel/agent/tools/fs/commandJob/start.js` — commandStart latency contract.
- `geelooy/apps/tunnel/agent/tools/fs/commandJob/schedulerExecution.js` — immediate launch coupling.
- filesystem executor/admission modules — acceptance-critical work and worker saturation.

## Server-side routing/reconciliation files to inspect

- `geelooy/api/tunnel/control/routes/fsVessel/liveDeviceIdentity.js`
- `geelooy/api/tunnel/control/routes/fsVessel/liveDevices.js`
- `geelooy/api/tunnel/control/routes/fsVessel/tunnelClient.js`
- `geelooy/api/tunnel/control/routes/fsVessel/responseContract*.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/durableRecordResult.js`
- `canonicalEnvelopes.js`, `stateMemory.js`, and durable retry/reconciliation tests.

## Likely new focused modules

- consumer-stall corroboration policy: combines transport, consumer, queue, mailbox, and recent-progress evidence;
- generation auto-repair controller: exact-generation replacement with cooldown/backoff and repair ledger;
- recovery eligibility model: distinguishes transient pressure from real wedged consumer;
- health projection model: transport/consumer/mailbox/worker/generation states independently;
- protected recovery action set: native-generation/doctor/reconcile actions bypass ordinary consumer-health quarantine.

## Verification files

- idle-health/stale telemetry regression;
- accepted-work no-false-stall regression;
- consumer wedged while transport alive auto-repair regression;
- cooldown/no-restart-storm regression;
- accepted mutation survives generation replacement regression;
- 100+/128 logical-agent admission/fairness/control-lane stress;
- long soak with alternating reads, writes, command starts, room actions, and idle periods.
