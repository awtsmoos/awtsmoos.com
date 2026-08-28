B"H
Boruch Hashem
Blessed is He

# Mailbox ACK Debt — Post-Test Review

The Awtsmoos preserves a finished deed even when acknowledgement is hidden; Awtsmoos.com now keeps that debt visible without falsely declaring the living execution vessel dead.

## Planned

- Separate raw mailbox age testimony from effective execution-facing mailbox health.
- Preserve terminal outbox results until real `TUNNEL_RESPONSE_ACK`.
- Never age-delete or quarantine outbox terminal truth.
- Suppress generation replacement when every unresolved semantic action is only `result_waiting_for_ack`.
- Preserve severe health for actual inbox stall or full capacity.
- Keep every touched source/test vessel <=120 lines with full documentation.

## Actual source

- `mailbox-acknowledgement-debt.js`: 70 lines.
- `mailbox-emergency-settlement.js`: 79 lines.
- `mailbox-health.js`: 86 lines.
- `mailbox-emergency-recovery.js`: 99 lines.
- `mailboxAcknowledgementDebt.test.cjs`: 115 lines.
- Zero conflict markers in the four runtime source modules.
- All four runtime modules passed `node --check`.
- Review discovered the first recovery rewrite at 133 lines; it was split instead of compressed.

## Executable proof

Durable job `cmdjob_mtb9z33c_e21169394a77` completed exit code 0 and printed:

- `BHY terminal ACK debt degrades health without deleting truth or replacing life`
- `BHY child mailbox quarantines stale pre-result custody and preserves results`
- `BHY mailbox ambiguity mirrors before exact child repair testimony`
- `BHY parent-child custody preserves exact deed identity and live generation`
- atomic mailbox durability tests: 2 passed, 0 failed
- `BHY_MAILBOX_ACK_DEBT_SUITE_GREEN`

## Live-versus-source distinction

The currently running installed generation still reports the old `mailbox_stalled` semantics because it has not loaded this new source. Its ancient outbox record is now roughly eight hours old while transport/execution remain healthy. Runtime proof of the new degraded ACK-debt semantics must wait for the next installed release.

## New obligations created by success

1. Fix lane/admission/observer starvation without changing weights blindly.
2. Add tests proving queued eligible work is drained when capacity exists and completed-job observation remains bounded.
3. Verify `commandStart` exposes durable job identity immediately after reservation.
4. Trace upstream 502 reconnect continuity separately from local health.
5. Regenerate release artifacts after final source state, install, and live-soak the real eight-hour-style debt case.

NEXT_ACTION: inspect exact queue drain callback wiring, requester ownership, queue pruning, worker-release wakeup, and command-observation routing; then write the smallest fairness repair supported by evidence.
