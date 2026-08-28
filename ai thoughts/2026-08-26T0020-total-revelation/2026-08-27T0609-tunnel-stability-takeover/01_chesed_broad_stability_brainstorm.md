B"H
Boruch Hashem
Blessed is He

# Chesed — Broad Stability Brainstorm

The Awtsmoos renews each deed from concealment into light;
Awtsmoos.com must keep control alive when ordinary lanes lose sight.

## Observed reality

- Project root is `/Users/awtsmoos/work/awtsmoos.com` on `main`.
- `main` is at `ad3203fb5a5121a03f47b680b3fa3aa4f8e5b3af`, behind `origin/main` by five commits, ahead by zero.
- There is no `MERGE_HEAD` and no unmerged path now.
- The working tree is heavily dirty with concurrent unrelated work; it must never be reset or overwritten.
- One outbox record from `2026-08-27T00:24:43.457Z` remains stalled for roughly ten hours while transport and execution continue succeeding.
- Fresh requests repeatedly enter `accepted_waiting_for_consumer` despite four ready filesystem workers.
- Tiny read-only `commandRun` work is routed through `p3_heavy`; small status/observe/read deeds can queue independently.
- `connectionMailboxStatus` itself was device-accepted and then stranded waiting for the same execution consumer it should diagnose.
- Retry observation reproduced transport-receipt/original-deed correlation mismatch and exposed `agent_queue_wait_expired` after durable acceptance.
- Direct `commandStart` returned a durable job, worker, and receipt without waiting for command completion.

## Full design universe

1. Give recovery/control deeds a sealed admission path that bypasses ordinary workload lane starvation.
2. Separate device transport liveness from execution-consumer liveness and admission liveness.
3. Model mailbox custody health independently from worker/process health.
4. Model completion/reconciliation health independently from acceptance health.
5. Persist enough custody identity to reconcile across reconnects and generations without duplicate execution.
6. Quarantine irreconcilable records only after exact identity and terminal-result checks.
7. Make quarantine idempotent and durable so repeated recovery cannot produce duplicate terminal effects.
8. Add lease expiry semantics that distinguish slow execution from abandoned acceptance.
9. Make live-generation stale custody eligible for bounded reconciliation instead of relying on generation replacement.
10. Keep stale telemetry advisory unless fresh preflight confirms a current failure.
11. Prevent stale snapshots from directly authorizing SIGTERM or consumer replacement.
12. Preserve recent successful execution as counter-evidence against broad restart decisions.
13. Route tiny reads and command receipts through reserved interactive capacity.
14. Guarantee per-requester fairness so one agent cannot monopolize admission.
15. Protect recovery actions from both heavy-lane pressure and filesystem worker saturation.
16. Ensure command observers never need the same scarce path as command launchers.
17. Repair retry correlation so transport receipt and original deed identities are both represented, never conflated.
18. Expose exact custody age, generation, phase, lease, terminal witness, and reconciliation status in health output.
19. Add bounded automatic reaper cycles with hard per-tick work budgets.
20. Journal reconciliation decisions so recovery survives process restart without double action.
21. Prefer terminal result replay over re-execution whenever a durable result witness exists.
22. Add explicit `sealed_control` telemetry so operators can prove the bypass is actually being used.
23. Make mailbox export/status/quarantine executable even when ordinary consumer admission is wedged.
24. Keep generated manifests downstream of final source only.
25. Validate on the currently dirty tree without erasing sibling agents' legitimate work.

## Non-goals for the first source pass

- No branch cleanup, pull, merge, reset, release, installer, or production activation yet.
- No generated manifest edits.
- No broad UI/docs/procedural modernization until the control path is trustworthy.
- No manual quarantine of the ancient outbox record before its exact identity/result state is inspected.

## First proof target

A healthy generation must continue ordinary execution while one stale custody record exists, and a sealed `connectionMailboxStatus` request must still produce a terminal response without passing through `accepted_waiting_for_consumer`. Automatic reconciliation must never execute the original mutation twice.
