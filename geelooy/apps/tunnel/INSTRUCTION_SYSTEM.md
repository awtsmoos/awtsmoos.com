B"H
Boruch Hashem
Blessed is He

# Awtsmoos Tunnel Instruction Protocol

The Awtsmoos gives every shliach a small doorway into deep law. Normal tunnel replies stay focused; detailed doctrine is retrieved only when the task requires it.

## Mandatory workflow before writing

1. Call `instructionResolve` with a concise description of the task, relevant tags, and file hints.
2. Read `requiredInstructionIds` and `instructionSummaries` from the response.
3. Call `instructionGet` for **every** required ID.
4. Read every returned full instruction body before editing, creating, moving, deleting, refactoring, styling, or deploying files.
5. Perform the work, then re-read touched files and verify the contracts required by the fetched packs.

This is a requirement, not a suggestion. Write-like tunnel responses repeat one short reminder, but they do not dump the full doctrine into every reply.

## Actions

### `instructionCatalog`

Returns every stable instruction ID with version, applicability tags, required-before-write status, and a one-sentence summary. It intentionally omits full instruction bodies.

### `instructionResolve`

Accepts task language such as `instructionTask`, `task`, `goal`, `query`, tags, and file hints. It returns the deterministic `requiredInstructionIds` for that work.

### `instructionGet`

Accepts one or many instruction IDs and returns the complete versioned instruction records. Unknown IDs are returned in `missingInstructionIds` and make the response unsuccessful.

## Compatibility for older clients

Clients whose action manifest predates the three dedicated actions can use `contextPack` or `aiContextPack`:

- `query: "instruction-resolve:<task description>"`
- `query: "instruction-get:<id>,<id>,..."`

Ordinary `contextPack` requests without these explicit prefixes keep their historical behavior.

## Instruction IDs

- `work.inspect-before-write` — Inspect real files, routes, runtime evidence, and contracts before changing anything.
- `work.whole-file-rewrites` — Rewrite modified files as complete coherent files; never use fragment surgery.
- `craft.continuous-improvement` — Treat the first acceptable result as a baseline and continue improving relevant surfaces safely.
- `work.verify-beyond-request` — Re-read touched files and verify behavior, contracts, edge cases, and adjacent regressions.
- `stability.safe-execution` — Protect recovery/control capacity and isolate destructive workloads.
- `ui.futuristic-professional` — Make visible surfaces deliberate, professional, futuristic, accessible, and fully finished.
- `ui.localized-styles` — Scope styles locally; forbid global leakage, overflow, accidental overlap, and undisciplined z-index.
- `ui.interaction-states` — Give every relevant interactive element complete hover, focus-visible, active, disabled, loading, and touch feedback.
- `ui.mobile-first-motion` — Build mobile-first responsive layouts with bounded performant motion and reduced-motion support.
- `code.javascript-architecture` — Keep JavaScript modular, data-driven, explicit, testable, and class-oriented only when truthful.
- `code.modularity-120` — Keep source files at or below 120 lines by splitting responsibility, never compressing readability.
- `code.naming-documentation` — Require substantial per-function/class JSDoc and precise names; use Torah/Kabbalah metaphors only when they clarify architecture.
- `api.simple-data-contracts` — Build simple explicit API contracts with focused defaults and additive compatibility.

## Focused response modes

The tunnel now treats response detail as an explicit API choice:

- default / `simple` — task result, correlation identity, continuation, one compact stability witness, and instruction protocol summary.
- `diagnostic` or `standard` — additionally returns queue, worker, receipt, process, and operational diagnostics.
- `full`, `debug`, `audit`, or `raw` — returns the unabridged response object.

This keeps normal multi-agent traffic small while preserving deep evidence for incident response.

## Stability law

Instruction actions are `p0_control`, so agents can obtain required doctrine even while heavy work is saturated. Tier-0 emergency remains intentionally narrow. Long stress, destructive transactional tests, and broad process experiments belong in isolated fixtures or a healthy primary—not in the emergency recovery lane.
