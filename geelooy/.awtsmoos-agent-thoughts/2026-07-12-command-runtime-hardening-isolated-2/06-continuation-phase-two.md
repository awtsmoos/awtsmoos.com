# B"H — Continuation Phase Two: Adversarial Integration Gates

## Required gates after compatibility

- Existing command and worker tests pass in independent processes.
- Aggregate test execution is analyzed separately for global-state contamination.
- The isolated 23-test kernel suite remains green.
- Bounded 1,000-command stress remains green.
- Mixed complete/cancel/timeout lifecycle remains green.
- Control latency remains bounded under queued load.
- Cross-root reconciliation is dry-run audited against real accumulated roots.
- A disposable copied agent launches, registers locally, executes commands, cancels descendants, restarts, and reconciles state.
- No unexpected child, timer, socket, registry, or job-store growth remains.

## Failure discipline

Any failure blocks live replacement. Every change must be a full-file rewrite, followed by syntax, import, targeted, compatibility, and stress evidence.
