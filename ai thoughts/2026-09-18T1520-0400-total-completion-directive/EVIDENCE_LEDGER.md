B"H

# Evidence Ledger

## Observed at takeover
- Primary and rescue both connected, ready, acceptance healthy, execution healthy.
- Both advertise releaseSourceSha `05804af10d587b51cc5c7539cb0b9f776be189a4`.
- Primary current parent PID observed as 2869 and child PID as 3785 during initial filesystem call.
- Current runtime exposes 7s ingress stale threshold and 15s pressure-progress grace in live telemetry.
- Current actionSchemaTrace invocation returned no useful target-action field schema for `mkdirp`, reproducing the reported introspection weakness.
- `mkdirp` calls using both `p` and `path` through the public control envelope returned `missing_path`, another concrete schema/usability signal.

## Evidence still required
Git, manifests, installs, jobs, missions, website registry, Chrome authority, release worktrees, regression suites, live fault injection, exactly-once proof.
