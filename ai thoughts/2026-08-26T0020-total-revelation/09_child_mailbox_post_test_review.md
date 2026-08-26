B"H
Boruch Hashem
Blessed is He

# Child Mailbox Post-Test Review

The Awtsmoos lets one deed keep one name while many vessels rise and fall; Awtsmoos.com now carries that identity across parent/child acceptance and heals safe stale child custody before watchdog testimony is published.

## Source architecture

- `mailbox-custody-metadata.js`: 82 lines; exact request/session/transport identity normalization.
- `child-mailbox-recovery.js`: 56 lines; child-local safe semantic reconciliation.
- `child-runtime-cycle.js`: 43 lines; heal -> inspect -> publish ordering.
- `child-runtime-custody.js`: 33 lines; ACK identity + live generation -> custody.
- `controller-message-router.js`: 73 lines; parent ACK carries original envelope identity.
- `child-message-router.js`: 59 lines; full ACK reaches runtime custody.
- `child-runtime.js`: 120 lines; composition root only.
- Zero conflict markers and all files pass `node --check`.

## New regressions

`mailboxCustodyIdentity.test.cjs` is 79 lines and proves the parent ACK retains requestId, requestKey, logicalAgentId, agentSessionId, controlRequestId, transportReceiptId, then child metadata stamps live generation 7.

`childMailboxRecovery.test.cjs` is 90 lines and proves expired accepted pre-result custody is quarantined exactly once with `safeToRedispatch:false`; a repeated pass is a no-op; result-waiting-for-ACK evidence is preserved and requests stronger replacement instead of deletion.

## Full focused gate

Durable command job `cmdjob_mt9pzjvo_908d2a472612` exited 0.

Passing proof includes:

- custody identity
- child semantic mailbox healing
- consumer recovery preflight
- repair ledger
- exact-parent watchdog repair
- connection-child liveness
- exact child-generation repair
- mailbox fsync/readback durability
- late-terminal exactly-once reconciliation
- relay envelope observation/redispatch safety
- deterministic single-browser sub-agent bridge

## Live before/after benchmark still pending deployment

The currently running old installed agent still creates generation-0 anonymous custody because it has not loaded this source. After installation, live acceptance must show non-empty request/session identity and generation >=1. Expired pre-result custody must disappear through child-local semantic recovery without a registration timestamp change or parent SIGTERM.

## Delta and shadow work

- Finish active Mitzvah preservation merge without mixing generated artifacts by hand.
- Merge remaining public-root history.
- Preserve concurrent tail, secret-scan, push main, delete non-main refs/worktrees, install main-only guards.
- Regenerate final tunnel agent manifest after all source merges.
- Run final tests/build/release/deploy/install.
- Soak acceptance/custody identity, expired semantic healing, lane admission, retry correlation, idle stability, and physical sub-agent communication.

NEXT_ACTION: resolve the active Mitzvah human conflicts from exact Git stage contents, then regenerate generated Mitzvah artifacts from their canonical builder.
