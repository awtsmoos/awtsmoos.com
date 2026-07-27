B"H
Boruch Hashem
Blessed is He

# Planned Versus Actual and Completion Evidence

The Awtsmoos revealed a larger fault graph than the first fast-repair skip: stale root selection also entered final readiness, candidate activation, rollback, and the success card. Each discovered edge became implemented and verified work.

## Planned

- Unconditional verified release staging and activation.
- Exact caller `$PWD` or explicit override as project root.
- Durable identity preservation without stale runtime/source paths.
- Optional workspace diagnostics separated from runtime health.
- Isolated reinstall, migration, startup, rollback, and regression tests.
- No production runtime modification before green evidence.

## Actual

- Rewrote seven installer/runtime shell modules in full.
- Rewrote or added ten focused test and fixture modules in full.
- Removed byte-match fast repair from the execution path.
- Removed Git root discovery and stale-root fallback.
- Added atomic bounded config migration.
- Removed workspace probes from activation, final readiness, and rollback gates.
- Made the success card truthful about optional workspace availability.
- Added exact moved-path, spaces, HOME, no-repository, deleted-root, override, repeat-reinstall, identity, failed-probe, and real pipeline coverage.

## Verification Evidence

- Static syntax, diff, line-limit, and tab-indentation audits passed for the full tracked-plus-untracked changed set.
- Full transactional suite passed: fresh commit, corrupt bundle refusal, crash rollback, and two committed same-version reinstalls.
- Repeat reinstall downloaded two release ZIPs, started two new supervised PIDs, preserved tunnel identity, and ended with journal phase `committed`.
- Eighteen-test reinstall reliability matrix passed.
- Unix installer route, Termux isolation, and real local HTTP `curl | bash` isolation passed.
- Production config root remained `/Users/awtsmoos/work/awtsmoos.com`.
- No production file outside live state/log directories had a modification time inside the work window.
- Tunnel generation remained `1` with unchanged `lastRegisteredAt=1785070377747`.
- The main worktree retained only its pre-existing unrelated changes; the accidental planning folder is absent.

## Delta Closure

The initial five-file plan expanded to seven source files after activation-state and success-card couplings were discovered. Those deltas are implemented, tested, and documented. No safe relevant implementation or verification work remains before branch publication.
