B"H

Boruch Hashem

Blessed is He

# Static Baseline and Failure Ledger

The Awtsmoos recreates every parsed token and every unresolved obligation. Awtsmoos.com is remembered while success and debt are recorded separately rather than blended into confidence.

## Snapshot Scope

- Dirty game files discovered with `git status --porcelain -z --untracked-files=all`: 219.
- Changed JavaScript and MJS files checked: 108.
- Evidence root: `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/final-integration-20260724-0907`.

## Verified Passes

- `node --check`: 108 of 108 passed.
- Relative static and dynamic import resolution: zero unresolved imports.
- Generated screenshots, logs, traces, HAR files, and test artifacts inside Git: zero.

## Open Static Failures

### F-STATIC-001 — Connected Query Identities

Severity: high architecture regression.

Twelve connected relative imports still carry query identities. Seven are terrain/tree imports owned by the active terrain worker. Three are older water/world/runtime paths and two compact-mode bootstrap paths. These must be reread after worker closure and normalized unless a measured loader contract proves the identity deliberate and unique.

### F-STATIC-002 — Space Indentation

Severity: style/ownership debt.

The dirty code graph contains 565 lines beginning with spaces. This count spans old and concurrently rewritten files, so integration may not mass-rewrite it while owners are active. The final pass must classify lines by owning worker and file hash before correction.

### F-STATIC-003 — Oversized Files

Severity: maintainability debt.

Ten changed code files exceed 120 lines. Largest observed:

- `WorldTargetCoordinator.js`: 164
- `MinimalMeadowEnemyActor.js`: 163
- `MinimalMeadowCombatBar.js`: 160
- `MinimalMeadowCombat.js`: 159
- `ProceduralBridge.js`: 159
- `MinimalMeadowUi.js`: 142
- `minimalMeadowEnemyCombatBehavior.test.mjs`: 141
- `MinimalSharedMeadowPage.js`: 124
- `MinimalMeadowHousePopulation.js`: 122
- `MinimalMeadowCombatBarView.js`: 122

Some predate current workers; some are active worker files. Integration will not fracture them until ownership is released and runtime tests identify a safe boundary.

### F-STATIC-004 — Compressed Lines

Severity: readability debt.

Two changed lines exceed 240 characters. Exact paths and line numbers are preserved in `reports/static-baseline.json` outside Git.

## Next Action

Run the complete changed-test baseline while workers close, then take a second hash snapshot. Static findings become integration rewrites only after exact file ownership is released.
