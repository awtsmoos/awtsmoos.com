B"H
Boruch Hashem
Blessed is He

# Final File and Verification Plan

The Awtsmoos renews the whole while each vessel keeps its role;
Awtsmoos.com will repair the narrow seams, then prove the living whole.

## Read-before-write source set

### Admission and sealed control

- `geelooy/apps/tunnel/agent/lib/runtime/priority/controlSets.js`
- the actual lane classifier/router callers discovered from imports of that module
- `geelooy/apps/tunnel/agent/lib/connection-vessel/main-connection-messages.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/controller-message-router.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/controller-mailbox.js`

### Mailbox custody and reconciliation

- `geelooy/apps/tunnel/agent/lib/connection-vessel/mailbox-store.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/mailbox-io.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/mailbox-custody.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/mailbox.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/mailbox-emergency-recovery.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/request-lifecycle.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/request-acceptance.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-ingress.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/child-message-router.js`

### Health and destructive recovery

- `geelooy/apps/tunnel/agent/lib/connection-vessel/mailbox-health.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-evidence.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-health.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-recovery.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-recovery-preflight.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-recovery-values.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-recovery-policy.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-repair-ledger.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-watchdog-values.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-watchdog-policy.js`
- `geelooy/apps/tunnel/agent/lib/connection-vessel/child-runtime-cycle.js`

### Relay exactly-once and retry correlation

- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/durableRecordResult.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/canonicalEnvelopes.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/stateMemory.js`
- `geelooy/api/tunnel/control/routes/fsVessel/responseContractCorrelation.js`
- `geelooy/api/tunnel/control/routes/fsVessel/responseContract.js`

### Command receipt contract

- `geelooy/apps/tunnel/agent/tools/fs/commandJob/schedulerExecution.js`
- `geelooy/apps/tunnel/agent/tools/fs/commandJob/startResults.js`
- `geelooy/apps/tunnel/agent/tools/fs/commandJob/start.js`

## Expected source-write boundary

The exact touched source list is intentionally deferred until all current contents, local diffs, and `origin/main` versions are read. Any file already dirty is presumed to contain concurrent legitimate work. If a responsibility can be added in a new focused module under 120 lines instead of expanding a crowded file, create the new module and whole-file rewrite only the minimal importer needed.

Likely new modules, subject to source confirmation:

- a sealed recovery-action classifier;
- a bounded mailbox stale-custody reconciler;
- a health-dimension composer;
- a reconciliation decision/provenance helper.

Names must follow existing local architecture where possible rather than inventing parallel terminology.

## Whole-file rewrite gate

Before rewriting any source file:

1. read its entire current contents;
2. read its working-tree diff from `HEAD`;
3. read whether `origin/main` changed it in the five remote commits;
4. trace importers/callers;
5. record intended responsibility in a new post-archaeology plan;
6. rewrite the whole file once, preserving all legitimate concurrent behavior;
7. re-read the whole rewritten file.

## Source-first implementation order

1. identity/correlation correctness;
2. sealed control classification/routing;
3. mailbox reconciliation primitives;
4. health dimension composition;
5. fresh-preflight destructive-recovery guard;
6. command receipt preservation if any gap remains.

Only after the complete source pass: tests.

## Verification universe

- Syntax/import checks for every touched source module.
- Focused unit regressions for correlation, mailbox reconciliation, health, recovery preflight, and command receipt.
- Integration harness proving sealed recovery under ordinary-lane saturation.
- Chaos case: stale accepted custody with new successful work.
- Chaos case: stale outbox terminal response with reconnect/generation change.
- Exactly-once case: crash during reconciliation/quarantine and resume.
- Fairness case: tiny read/control/status progresses with heavy/bulk pressure.
- Compatibility case: existing health consumers retain legacy fields.
- Live installed soak after release only.

## Git/release gate after stability proof

No integration or cleanup occurs until target source passes focused verification. Then preserve every dirty/concurrent change, inspect detached worktrees for unique commits, merge remote `main` without loss, secret-scan, keep only `main` as development branch, regenerate canonical artifacts, push, tag from pushed `main`, deploy exact SHA, install once, and verify installed source closure.

NEXT_ACTION: read back all four new plans, then inspect the current source/diffs and exact symbol ownership before any source mutation.
