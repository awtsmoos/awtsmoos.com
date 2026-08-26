B"H
Boruch Hashem
Blessed is He

# Child Mailbox Root Cause — Exact Stability Patch

The Awtsmoos gives one deed one identity while it crosses many vessels; Awtsmoos.com must never let a process boundary erase the name of the deed it is guarding.

## Observed root cause

1. The parent controller accepts an exact child request and sends `connection.ack` containing only `id` and `transportReceiptId`.
2. `child-message-router.js` extracts only that receipt ID.
3. `child-runtime.js` calls `foundation.mailbox.noteParentCustody(receiptId)` with no metadata.
4. `mailbox-custody-record.identity()` therefore stores blank request/logical/session fields and `generation: 0`.
5. The connection child owns this custody map; the parent controller owns a different mailbox object registered with `mailbox-emergency-registry.js`.
6. Therefore the parent-side P0 semantic healer is not the same in-memory custody map shown by child health.
7. Child custody can remain expired/orphan-like until later settlement or generation replacement even while fresh execution succeeds.

## Patch design

- Add one small custody-metadata module that extracts request identity from the original envelope and ACK.
- Rewrite parent `controller-message-router.js` so `connection.ack` carries requestId, requestKey, logicalAgentId, agentSessionId, controlRequestId, transportReceiptId.
- Rewrite `child-message-router.js` so the full ACK metadata reaches runtime custody.
- Rewrite `child-runtime.js` so custody receives those fields plus the live `foundation.state.generation`.
- Add a child-local semantic healer that inspects the child mailbox before watchdog publication and calls existing `mailbox-semantic-recovery.js` only when exact custody is stale.
- Child-local healing may quarantine expired pre-result custody but must never replay it.
- Result-ready/result-waiting-for-ACK testimony remains preserved; ambiguity is reported rather than deleted.
- Parent watchdog still keeps fresh-progress/preflight vetoes as an independent second safety layer.

## Verification

- ACK identity survives parent -> child IPC.
- Parent custody records show generation 1+ and logical/session/request identity instead of anonymous generation 0.
- Expired accepted pre-result child custody quarantines during child state publication without parent SIGTERM.
- Result-bearing custody is preserved.
- Repeated child reconcile is idempotent.
- Existing mailbox durability, watchdog, and exactly-once regressions remain green.

NEXT_ACTION: resolve write instructions, rewrite the two routers and child runtime, add the two small helper modules, reread, then write/run focused regressions.
