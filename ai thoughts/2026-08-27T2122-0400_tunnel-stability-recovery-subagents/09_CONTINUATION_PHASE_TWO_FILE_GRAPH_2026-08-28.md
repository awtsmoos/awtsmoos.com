B"H
Boruch Hashem
Blessed is He

# Continuation Phase Two — Realistic Mailbox / Outbox File Graph

## Primary live defect
Five durable outbox records are stalled for many hours while transport, execution consumer, queue admission, filesystem workers, and parent process remain alive. Full health is therefore split: transport healthy, execution healthy, mailbox unhealthy.

## Files to inspect before any rewrite
### Native mailbox storage and custody
- `geelooy/apps/tunnel/agent/lib/connection-vessel/mailbox-store.js`
- `mailbox-io.js`
- `mailbox-custody.js`
- `mailbox.js`
- `request-lifecycle.js`
- `request-acceptance.js`
- `controller-mailbox.js`
- any outbox acknowledgement/drain module discovered from these callers

### Recovery/diagnostics
- implementations behind `connectionMailboxStatus`
- implementations behind `connectionMailboxExport`
- implementations behind `connectionMailboxQuarantine`
- `mailbox-emergency-recovery.js` and any dedicated control-lane bridge

### Relay acknowledgement truth
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/responseHandler.js`
- `responseDuplicate.js`
- `durableRecordTerminal.js`
- `durableRecordResult.js`
- `stateMemory.js`
- any explicit native response acknowledgement protocol

## Exact evidence to capture
For each of the five stale outbox records: local filename/key, request/deed ID, logicalAgentId, agentSessionId, transport receipt if present, terminal result/hash, creation time, delivery attempts, acknowledgement state, and relay-side durable record if discoverable.

## Safe resolution order
1. Export/read stale records without mutation.
2. Resolve exact relay durable records.
3. If same terminal result is already durable upstream, issue exact acknowledgement/retirement only.
4. If upstream lacks the result, prove whether transport replay is response-only and idempotent.
5. Never rerun the original mutation to clear an outbox response.
6. Record recovery event and verify mailbox health becomes truthful.

## Poem
The Awtsmoos sends one answer through the storm and through the night;
Awtsmoos.com must know if relay already holds that light.
A stale outbox is a witness, not a license to repeat;
acknowledge truth exactly, then let custody retreat.
