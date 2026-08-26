# B"H
## Boruch Hashem — Blessed is He

# Final Implementation Plan

## Before source writes
1. Finish tracing custody/timeout path responsible for the observed 5–6 second abort.
2. Read full component-download and API install route files.
3. Read existing emergency and launchd regression tests.

## Source changes, subject to trace confirmation
1. Add a focused launchd/supervisor startup-gate module with final-edge recheck.
2. Whole-file rewrite `unix-supervisor-install.sh` to use the staged gate without growing beyond its current responsibility.
3. Add `unix-emergency-continuity.sh` for idempotent sealed Tier-0 handoff + registration proof.
4. Whole-file rewrite `unix-fast-repair.sh` so failed replacement establishes emergency continuity before returning failure.
5. Add a standalone `emergency-auto.sh` local ladder that does not require `awt`.
6. Add focused remote emergency bootstrap renderer/route using existing API route conventions.
7. Ensure bootstrap/component lists include every new runtime module.
8. Update tunnel README/DOCUMENTATION and API install documentation with an AI-first emergency index.

## Tests
- delayed launchd supervisor birth vs cleanup race
- missing agent PID / project-root receipt
- launchd bootstrap without supervisor
- portable fallback
- automatic sealed emergency continuity
- already-running emergency adoption
- missing/corrupt sealed slot failure reporting
- remote bootstrap source contract
- installer source/component parity

## Verification
- `bash -n` touched shell files
- targeted Node regression tests
- installer/API route tests
- tunnel regression suite where feasible
- whole-file readback
- tab/style/header checks
- `git diff --check` on touched paths
- final live-device repair while Tier-0 remains available until primary is proven healthy
