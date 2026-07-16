B"H

# Dayuh Chadash Cutover — Release Notes

## Purpose

This release prepares Awtsmoos.com to keep canonical social data below a one-gigabyte
budget without deleting divergent or historical content. Active AI and RAG assets move
to a separately budgeted runtime root, while legacy social stores move to reversible
quarantine.

## Included

- Portable environment-driven path policy with no operator-specific home directory.
- Explicit allowlisted inventory of AI assets, raw social divergence, comment shards,
  corpus databases, and legacy `.awtsocial` stores.
- Same-device atomic rename enforcement.
- Measured offline gate for managed PIDs, port ownership, and open data descriptors.
- Crash-safe state persisted after every completed rename.
- Exact RAG manifest rebasing with original text retained for rollback.
- Installed-generation verification for canonical files, inode identity, manifests,
  canonical data budget, and external runtime budget.
- Explicit `plan`, `install`, `testing`, `verify`, `accept`, `rollback`, `recover`, and
  `state` commands.
- Exact 28-path publication scope that excludes concurrent Android, tunnel-runtime,
  game, database, evidence, lock, quarantine, and temporary changes.
- Canonical comment reads ordered as compressed FS3, DosDB compatibility contract,
  then temporary derived-shard fallback.
- Cross-surface account navigation with Treasury, Budgets, Bank, Tunnel Control,
  Code, and Virtual OS portals available in online and offline states.

## Verified courts

The final repository-wide `npm test` passed on July 16, 2026. The final scoped release
sequence also passed every required command independently:

- `npm run test:dayuh-release`
- `npm run test:dayuh-cutover`
- `npm run test:routes`
- `npm run test:comments`
- `npm run test:social-content`
- `npm run test:social-packed`
- `npm run test:packed-engine`
- `node --test tools/dayuhChadashMaintenance/test/*.test.js`

The verified results include:

- Route coverage.
- Treasury and cross-surface portal contracts.
- Comment subsystem: 7/7 tests.
- Social content.
- Social packed migration and repair.
- Packed engine.
- Maintenance state machine: 18/18 tests.
- Cutover publication court: 10/10 tests.
- JavaScript syntax, tab indentation, 120-line ceiling, documentation, exact
  publication scope, portable paths, and Git whitespace.

The cutover court inspected 18 JavaScript files and reported a maximum of 107 lines.
Across all changed publication JavaScript files, the largest file contains 117 lines.

## Repository status

The previously observed treasury failure, `Code account panel missing PORTALS`, was
repaired in the two account-panel modules and verified by both its focused court and
the complete repository test chain. No known fixable repository failure remains hidden
or waived for this publication.

The working tree still contains independently owned concurrent work outside the exact
publication manifest. Those changes are not part of this release and must not be
staged, overwritten, or discarded.

## Operational status

The cutover transaction has not been executed by this source-publication pass. Live
data remains in its current paths, the cutover state is `idle`, and no quarantine
retention generation may be removed as part of publication.

The read-only plan preserves raw divergent social content and historical stores by
moving them to quarantine rather than deleting them. Directories report inode metadata
size in the plan; final physical budgets are verified after installation with `du`.

## Publication commands

```sh
npm test
npm run test:dayuh-release
npm run test:dayuh-cutover
npm run dayuh:cutover:state
node tools/dayuhChadashCutover/cli.js plan
```

Use the direct `node ... plan` form when redirecting machine-readable JSON; `npm run`
prints its own command banner unless invoked with `--silent`.

## Acceptance boundary

Publication of source does not authorize live installation. Operators must follow
`PUBLISHING.md`, stop production, prove the offline gate, install once, run every live
social, RAG, restart, rollback, no-growth, storage-budget, and maintenance court, and
call `accept` only after verification is green. On any failure, production must remain
stopped while `rollback` restores the prior generation.
