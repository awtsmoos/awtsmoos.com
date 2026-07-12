# B"H — Command Runtime Hardening Mission

## Safety boundary

The currently running tunnel remains untouched. No installer, restart, process replacement, production route change, or live store migration is permitted during this mission. All new command-runtime behavior must first run from temporary roots, isolated worker processes, separate job stores, and non-live module paths.

## Objective

Make command execution reliably available to many agents without crossed receipts, stale jobs, process leaks, unbounded registries, orphan descendants, output-store explosions, or control-plane starvation.

## Required invariants

1. Every command has immutable job, worker, receipt, request, session, and process-birth identity.
2. A PID alone is never sufficient evidence that the original child still exists.
3. Commands run in isolated process groups where the platform supports them.
4. Cancellation is idempotent, revisioned, and cleans descendants by deadline.
5. Terminal metadata cannot return to running.
6. Startup reconciliation closes or adopts every persisted running job.
7. Active and recent registries are bounded by policy, with overload receipts.
8. Output is bounded incrementally; status does not rescan entire files.
9. Poll, wait, output, and cancel remain responsive under heavy command load.
10. The live tunnel is not updated until deterministic, stress, crash, leak, compatibility, and soak evidence pass.

## Evidence labels

Every conclusion must be marked implemented, tested, observed, inferred, not yet tested, known limitation, blocked, safe for isolated testing, or safe for live migration.

## Current verdict

The current replacement tunnel can execute commands, but fleet-scale use is not yet proven. One or two low-risk agents are acceptable; large fleets and long-running workloads should wait for this hardening pass.
