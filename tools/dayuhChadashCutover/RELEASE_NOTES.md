B"H

# Dayuh Chadash Self-Cleaning Storage — Release Notes

## Purpose

This release prepares Awtsmoos.com to keep canonical social truth and active AI/RAG
assets beneath one absolute two-gibibyte ceiling without deleting divergent,
historical, or rebuildable content. Canonical FS3 databases remain authoritative,
active AI moves to a portable runtime root, and legacy or development-heavy vessels
move by reversible same-device rename into retained quarantine.

## Included

- Portable environment-driven path policy with no operator-specific home directory.
- Explicit `AWTSMOOS_DB_ROOT` support with `AWTS_DB_ROOT` compatibility.
- One combined canonical-plus-runtime hard ceiling, defaulting to 2,147,483,648 bytes.
- Compact llama runtime containing only `llama-embedding` and required libraries.
- macOS rpath rebasing to `@loader_path` and mandatory real 384-dimensional probe.
- Nested quarantine of the llama.cpp development checkout before the AI parent move.
- Same-device atomic rename enforcement and crash-safe state after every boundary.
- Exact RAG manifest rebasing with original text retained for rollback.
- Canonical post bridging between rich content records and packed series records.
- Immediate packed/rich synchronization after edits and safe legacy-marker migration.
- Dynamic response classification that preserves domain records containing
  `contentType`, preventing valid posts from serializing as `null`.
- Combined-budget maintenance alarms while preserving WAL vacuum and FS3 compaction.
- Guarded real HTTP journey against a temporary DosDB root and private port.
- Exact 66-path publication scope excluding runtime, evidence, quarantine, logs,
  credentials, tunnel state, and unrelated concurrent work.

## Verified courts

The complete repository-wide `npm test` passed on July 17, 2026. The scoped release
sequence also passed independently:

- `npm run test:dayuh-release`
- `npm run test:dayuh-cutover`
- `npm run test:routes`
- `npm run test:comments`
- `npm run test:social-content`
- `npm run test:social-packed`
- `npm run test:packed-engine`
- `node --test tools/dayuhChadashMaintenance/test/*.test.js`

The final source results include:

- Cutover court: 34/34 tests.
- Maintenance court: 19/19 tests.
- Comment subsystem: 7/7 tests.
- Real private-server journey for alias, heichel, series, post, comment, question,
  answer, repeated read stability, deletion, and cleanup.
- JavaScript syntax, tab indentation, 120-line ceiling, documentation, portable
  paths, exact publication scope, and Git whitespace.
- Release checker: 42 JavaScript files, 16 test files, 66 publication paths, and a
  largest changed JavaScript file of 117 lines.

## Real corpus and runtime proof

A read-only publication preflight copied the actual runtime from the canonical build,
patched it, hashed it, and removed the temporary stage after verification.

- Compact runtime allocation: 18,968,576 bytes.
- `llama-embedding` SHA-256:
  `a9efb4653095a2d75938a65926a0be424e9ee465c1c10387d6d66d981c34b5a4`.
- Embedding dimensions: 384.
- Portable rpath: `@loader_path`.
- Persisted lanes:
  - `sefer-hasichos`: 15,022 records.
  - `likkutei-sichos`: 6,139 records.
- Both lanes passed text search and persisted-vector search with the copied runner.
- Installation and fallback were disabled throughout the proof.

Canonical allocation was identical before and after the preflight.

## Storage projection

Measured allocated bytes before any live move:

- Current canonical root: 7,260,708,864 bytes.
- Current AI tree: 1,767,149,568 bytes.
- Development checkout to quarantine: 963,219,456 bytes.
- Divergent raw social tree to quarantine: 1,080,832,000 bytes.
- Allowlisted derived packed stores to quarantine: 3,444,678,656 bytes.

Projected active generation after cutover:

- Canonical data: 968,048,640 bytes.
- Lean AI runtime: 822,898,688 bytes.
- Combined active allocation: 1,790,947,328 bytes.
- Absolute limit: 2,147,483,648 bytes.
- Remaining headroom: 356,536,320 bytes.

## Operational status

The cutover transaction has not been executed by this source-publication pass.
Production remains live on its current paths, the runtime destination is absent, and
no quarantine generation has been deleted. The plan preserves raw divergent social
content and historical stores by moving them to quarantine rather than deleting them.

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
`PUBLISHING.md`, stop production through its managed supervisor, prove the offline
gate, install once, run every live social, RAG, restart, rollback, no-growth,
storage-budget, and maintenance court, and call `accept` only after verification is
green. On any failure, production must remain stopped while `rollback` restores the
prior generation.
