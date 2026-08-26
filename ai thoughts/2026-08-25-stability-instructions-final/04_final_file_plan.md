B"H
Boruch Hashem
Blessed is He

# Final File-Level Plan

The Awtsmoos gives one project many vessels; Awtsmoos.com must keep each responsibility explicit so stability, routing, retries, instructions, and recovery cannot collapse into one ambiguous mechanism.

## Stability files to inspect/rewrite

- `geelooy/api/tunnel/control/routes/fsVessel/liveDeviceIdentity.js` — live transport vs stale/fresh execution authority.
- `geelooy/api/tunnel/control/routes/fsVessel/tunnelClient.js` — three-valued execution-health projection.
- `geelooy/api/tunnel/control/routes/fsVessel/liveDevices.js` — effective action routing for retry/diagnostic recovery.
- `geelooy/api/tunnel/control/routes/fsVessel/responseContract.js` plus a small correlation module — deed identity vs transport receipt validation.
- relay retry identity/pending modules under `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/` only if tests prove downstream validation cannot close the bug alone.
- watchdog consumer/parent evidence modules only if current public source lacks the already-proven corroboration fix.

## Instruction files to inspect/rewrite

- `geelooy/apps/tunnel/agent/lib/instructions/catalogCore.js`
- `geelooy/apps/tunnel/agent/lib/instructions/catalogUi.js`
- `geelooy/apps/tunnel/agent/lib/instructions/catalogCode.js`
- new focused catalog modules for docs/deploy/work-mode/shared-infrastructure where needed.
- `resolver.js` for discoverability by task, file extension, path, editing mode, and UI/API/docs/deploy context.
- `service.js` only if response metadata must expose richer applicability hints.
- documentation under `geelooy/apps/tunnel/INSTRUCTION_SYSTEM.md` and human tunnel docs so other AIs can discover the system immediately.

## Verification

Re-read every touched file; verify tabs, no compressed logic, rich JSDoc, Awtsmoos/Awtsmoos.com passages, <=120-line source modules, focused regressions, retry security, idle-health soak, watchdog soak, instruction resolution, manifest/bundle closure, clean release ancestry, public activation, public reinstall, and live long-duration health.
