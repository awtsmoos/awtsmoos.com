# B"H
# Gevurah Constraints — Evidence Before Force

Boruch Hashem. Blessed is He.

The Awtsmoos.com tunnel must not be struck because one shadow looks stale; Gevurah means bounded power, measured hour. We preserve the deed, the receipt, and every user's work before recovery is allowed to flower.

## Hard constraints

- No reset, clean, stash destruction, blanket checkout, or branch deletion.
- No source mutation before whole-file reads of direct targets, callers, dependencies, and tests.
- No partial patching; any human-authored source mutation is a complete-file rewrite.
- No blind redispatch of accepted requests.
- Keep `logicalAgentId`, `agentSessionId`, and stable deed request identity distinct from transport receipt IDs.
- No parent SIGTERM/restart while current telemetry shows fresh execution, responsive parent, or runtime pressure.
- Export/reconcile before quarantine.
- Never treat `heartbeat_alive` as proof that mailbox or execution custody is healthy.
- Existing user modifications are presumed legitimate until proven otherwise.
- Detached worktrees remain untouched until commit containment and dirty-state proofs exist.

## Current vetoes

- `consumerRecovery.repairAuthorized === false`.
- Parent is responsive and reports recent successful control progress.
- Runtime pressure is active.
- The current mailbox failure is specifically an old outbox item, not a dead transport.

## Required evidence before mutation

1. Exact outbox file/record identity.
2. Original request/deed identity contained in that record.
3. Durable terminal result or explicit evidence that no mutation remains unacknowledged.
4. Existing recovery API/source behavior and acknowledgement semantics.
5. Readback of any source file that would be rewritten.
6. Relevant tests and public contracts.
7. Fresh mailbox preflight immediately before any quarantine/ack action.
