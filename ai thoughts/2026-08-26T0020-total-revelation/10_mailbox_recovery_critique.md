B"H
Boruch Hashem
Blessed is He

# Phase Three — Mailbox Recovery Critique

The Awtsmoos gives Gevurah to every healing act; Awtsmoos.com must prove that repair cannot become the next source of instability.

## Thirty safeguards and improvements

1. Never treat `generation:0` alone as stale; fresh current custody legitimately uses it.
2. Preserve native durable acceptance semantics after queue admission.
3. Never redispatch an accepted mutation because its consumer never started.
4. Quarantine only lease-expired pre-result exact custody.
5. Preserve result-bearing custody across child replacement.
6. Preserve request ID and phase in every recovery testimony.
7. Child semantic recovery remains the first healer because it owns the custody map.
8. Parent replacement occurs only when child semantic recovery explicitly says `replacementRequired:true`.
9. Publish recovery testimony after the semantic attempt, not before it.
10. Mirror the triggering child state before requesting repair so diagnostics retain evidence.
11. Use the existing exact-child repair object; do not add parent SIGTERM logic.
12. Expose supervisor repair as a narrow façade rather than leaking repair internals.
13. Existing repair idempotence prevents repeated STATE frames from repeated TERM.
14. Existing PID check prevents escalation against a newer child.
15. Existing exit handler clears repair state before restart.
16. Preserve restart backoff and registered-state reset behavior.
17. Do not use terminal child messages for recoverable ambiguity because terminal handling intentionally prevents restart.
18. Do not make the parent emergency registry pretend to own child in-memory custody.
19. Keep parent mailbox recovery for parent-side persisted response custody where applicable.
20. Add explicit `mailboxRecovery` state so diagnostics explain why a child was replaced.
21. Bound recovery reason strings before lifecycle logging.
22. Fresh/attempted-false recovery state must never request repair.
23. Safe quarantine success must never request repair.
24. Missing exact ID must request replacement rather than guessed deletion.
25. Quarantine failure must request replacement rather than repeated destructive mutation.
26. Result-waiting-for-ack must request replacement so replay can preserve terminal truth.
27. Test repeated replacement-required frames against one owned PID.
28. Test replacement against a changed PID to ensure old escalation cannot hit the new child.
29. Keep queue-expiry tests unchanged so exactly-once safety remains conservative.
30. After release, prove under live soak that child replacement can occur without parent/tunnel route disappearing.

## Additional scheduler debt discovered

Separate from mailbox recovery, admission can still delay P1/P3/P4 work even with idle workers and a healthy circuit. That is a second work node, not a reason to contaminate the mailbox repair. After the mailbox bridge is complete and tested, trace fair-queue requester ownership, queue timers, and worker reservation telemetry separately.

NEXT_ACTION: write the final exact implementation/test file plan, then resolve repository instructions and implement source before tests.
