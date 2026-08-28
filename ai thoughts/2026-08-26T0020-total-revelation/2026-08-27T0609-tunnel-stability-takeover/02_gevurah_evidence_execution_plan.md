B"H
Boruch Hashem
Blessed is He

# Gevurah — Evidence-Bound Execution Plan

The Awtsmoos gives boundary to light so repair becomes exact;
Awtsmoos.com will change no living file until evidence closes the gap.

## Phase A — Reconcile before source writes

1. Observe or terminally reconcile the already-accepted mailbox symbol search without redispatching it.
2. Read current working-tree source and current diffs for the mailbox, admission, health, retry-correlation, and recovery paths.
3. Compare those paths against `origin/main`, because local `main` is five commits behind and must not silently overwrite remote work.
4. Inspect exact implementations and callers of `connectionMailboxStatus`, `connectionMailboxExport`, `connectionMailboxQuarantine`, `accepted_waiting_for_consumer`, `queued_waiting_for_lane`, and `agent_queue_wait_expired`.
5. Inspect the stale outbox record through export/status evidence only; do not quarantine until exact request/result identity is known.

## Phase B — Choose smallest correct source boundary

Source changes must preserve concurrent dirty work and use whole-file rewrites only. Prefer new small modules over expanding large files. The likely responsibilities are:

- sealed control/recovery action classification and routing;
- admission fairness for interactive/control/read operations;
- mailbox custody reconciliation and exact-once terminal handling;
- health dimension decomposition;
- fresh-preflight guard before restart/termination;
- retry receipt/original deed correlation.

No file will be rewritten until its full current contents and current diff are read.

## Phase C — First complete source pass

1. Implement sealed recovery routing so mailbox status/export/quarantine bypass ordinary consumer admission.
2. Implement bounded stale-custody reconciliation using durable identity, generation, lease, and terminal witnesses.
3. Make reconciliation idempotent and quarantine durable.
4. Split health into transport, execution consumer, admission, worker, mailbox custody, and completion/reconciliation dimensions while preserving compatibility fields.
5. Ensure stale telemetry cannot alone mark the route unusable.
6. Require fresh preflight evidence before any mature snapshot can authorize destructive consumer repair or SIGTERM.
7. Correct retry correlation semantics if the working-tree source does not already fully contain the known fix.
8. Preserve direct `commandStart` durable receipt behavior; improve only if source evidence shows a gap.

## Phase D — Readback and delta

- Re-read every touched source file completely.
- Compare planned versus actual responsibilities.
- Record any missing behavior as a new mission note before tests.
- Do not begin tests until the first source pass is complete.

## Phase E — Focused verification

After source completion:

- exact-once late-terminal result regression;
- retry transport-receipt/original-deed regression;
- stale accepted custody reconciliation regression;
- stale outbox terminal-witness regression;
- sealed-control admission regression under ordinary-lane saturation;
- admission fairness regression for tiny reads/control/commandStart;
- health dimension compatibility regression;
- recovery preflight no-fresh-evidence-no-terminate regression;
- commandStart immediate durable receipt regression.

## Phase F — Live proof before release

Only after tests pass and all concurrent changes are preserved on `main`:

1. Regenerate the tunnel manifest canonically.
2. Push exact `main` source and generated release artifacts in controlled commits.
3. Tag only from pushed `main`.
4. Deploy exact pushed SHA.
5. Install public agent once.
6. Prove installed `releaseSourceSha` equals released `main` SHA.
7. Soak idle/load/reconnect and inspect lifecycle history.
8. Prove sealed mailbox control remains responsive while ordinary workload is pressured.
9. Prove stale custody self-reconciles without generation replacement and without duplicate mutation.

## Safety invariants

- No reset, checkout-over, rebase, pull, or branch deletion while the dirty tree is unresolved.
- No blind retry of accepted mutations.
- No hand-edited generated artifacts.
- No release claim from tests alone; live installed evidence is required.
