B"H
Boruch Hashem
Blessed is He

# Phase Two — File and Dependency Graph

## Connection vessel
`geelooy/apps/tunnel/agent/lib/connection-vessel/`
- parent-consumer-recovery.js
- parent-consumer-recovery-preflight.js
- parent-consumer-recovery-policy.js
- parent-consumer-recovery-values.js
- parent-consumer-repair-ledger.js

Trace callers before edits. Preserve candidate → corroboration → preflight → durable claim → exact PID/generation repair.

## Mailbox
- mailbox-store.js
- mailbox-io.js
- mailbox-custody.js
- mailbox.js
- request-lifecycle.js
- request-acceptance.js
- parent-consumer-ingress.js
- child-message-router.js
- controller-message-router.js
- controller-mailbox.js

Inspect persistence sequence and custody retirement/reconciliation.

## Relay
`ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/`
- durableStore.js
- durableRecord.js
- durableRecordTerminal.js
- durableRecordResult.js
- canonicalEnvelopes.js
- stateMemory.js
- responseHandler.js
- responseDuplicate.js

Trace queued → dispatched → accepted → progress → terminal, especially late terminal truth.

## Request identity
`geelooy/api/tunnel/control/routes/fsVessel/`
- responseContract.js
- responseContractCorrelation.js
- liveDeviceIdentity.js
- liveDevices.js
- tunnelClient.js

Keep logicalAgentId, agentSessionId, deed ID, wrapper control ID, and transport receipt ID separate.

## Command jobs
`geelooy/apps/tunnel/agent/tools/fs/commandJob/`
- start.js
- startResults.js
- scheduler.js
- schedulerExecution.js
- schedulerRunner.js
- launcher.js
- lifecycle.js
- liveLifecycle.js
- liveProcessEvents.js
- finalization.js
- ownership.js

Prove commandStart receipt latency independently of runtime.

## Browser / mission
- tools/fs/actionGroups/websiteAgents/
- tools/fs/actionGroups/missionBrowserSpawnActions.js
- tools/fs/actionGroups/missionBrowserSpawnIdentity.js
- tools/fs/actionBuilderGroups/missionActions.js

## Instructions / release
- agent/lib/instructions/*
- agent/manifest.txt (generated only)
- scripts/generate-tunnel-agent-manifest.cjs
- scripts/production/canonical-server-activate.sh
- scripts/production/virtual-ssh-listener-probe.sh
- scripts/bhRelease.mjs

## Poem
Many files are keilim, one current underneath;
the Awtsmoos renews each import, every branch and wreath.
Awtsmoos.com records the path where hidden causes show;
we read the vessels first, then only change the flow.
