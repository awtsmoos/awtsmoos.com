# B"H — Exact File Plan

## New isolated modules

Create under:

`/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/command/`

- `admission.js` — hard active cap and start overload receipts.
- `identity.js` — command hash, idempotency identity, and process birth identity contracts.
- `processControl.js` — process-group spawn and cleanup escalation.
- `transitions.js` — legal lifecycle transitions and terminal precedence.
- `activeRegistry.js` — bounded ownership with unconditional release.
- `outputCounters.js` — incremental byte and character accounting.
- `reconciler.js` — pure reconciliation decisions.
- `index.js` — isolated command-core exports.

## New isolated tests

Create under:

`/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/tests/command/`

- `identity.test.cjs`
- `transitions.test.cjs`
- `admission.test.cjs`
- `registry.test.cjs`
- `processGroupCleanup.test.cjs`
- `pidReuse.test.cjs`
- `reconciliation.test.cjs`
- `stress.cjs`
- `leakCycles.cjs`
- `shortSoak.cjs`

## Repository integration files

Only after isolated tests pass, read and fully rewrite as needed:

- `geelooy/apps/tunnel/agent/tools/fs/commandJobStore.js`
- `geelooy/apps/tunnel/agent/tools/fs/commandJob/process.js`
- `geelooy/apps/tunnel/agent/tools/fs/commandJob/metaFactory.js`
- `geelooy/apps/tunnel/agent/tools/fs/commandJob/finalize.js`
- `geelooy/apps/tunnel/agent/tools/fs/commandJob/io.js`
- `geelooy/apps/tunnel/agent/tools/fs/commandJob/gc.js`
- `geelooy/apps/tunnel/agent/lib/runtime/worker-registry.js`

Potential new production modules:

- `commandJob/admission.js`
- `commandJob/activeJobs.js`
- `commandJob/cancel.js`
- `commandJob/lifecycle.js`
- `commandJob/reconcile.js`
- `commandJob/runtime.js`
- `commandJob/processIdentity.js`
- `commandJob/start.js`
- `commandJob/status.js`
- `commandJob/wait.js`

The facade `commandJobStore.js` should contain imports and public exports only, under 120 lines.

## Existing tests to preserve

Run unchanged:

- `commandRunAsyncDefault.test.cjs`
- `commandConcurrentWaitRace.test.cjs`
- `multiSessionCommandIsolation.test.cjs`
- `cancelOneWorkerDoesNotCancelOthers.test.cjs`
- `detachedAndStaleWorkerRecovery.test.cjs`
- `manySubprocessWorkersStress.test.cjs`
- `workerRegistryCap.test.cjs`
- `isolatedTunnelStressHarness.test.cjs`
- command alias and correlation tests.

## Evidence artifacts

Write command receipts, process snapshots, handle counts, store-size samples, and latency percentiles under this planning directory. Never rely only on command output returned through the relay; also write and directly read evidence files.

## Forbidden files and actions

Do not modify `/Users/awtsmoos/.awtsmoos-tunnel/`, the running supervisor, live PID files, installer scripts, public routing, or production job metadata. Do not restart or reinstall the tunnel during this mission.
