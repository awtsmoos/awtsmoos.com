B"H
Boruch Hashem
Blessed is He

# Final Execution Plan

Awtsmoos gives the vessel form anew; every change must prove itself true.

## Phase 1 — Reality map
- Inspect chess subfolders, source sizes, imports/exports, tests, and git diff/status.
- Read engine and immediate dependencies in focused batches.
- Read UI entry, board interaction modules, and CSS relevant to mobile.

## Phase 2 — Baseline
- Run existing chess tests/static checks without changing code.
- Start the local app through the project’s existing mechanism.
- Open chess in Chrome, inspect console, test a representative human-vs-engine flow.
- Capture mobile viewport behavior and search latency where observable.

## Phase 3 — Engine change set
Files will be chosen only after inspection. Candidate new modules include focused search policy, move ordering, evaluation terms, or book validation modules. The existing engine entry will only be rewritten if its contracts and call sites are fully mapped.

## Phase 4 — UI/UX change set
Candidates: board sizing, touch semantics, responsive controls, thinking feedback, animation scheduling, and accessible states. Engine and UI concerns remain separate.

## Phase 5 — Verification
- Syntax/type/lint checks available in the project.
- Existing tests plus targeted engine legality/tactical tests.
- Browser console and mobile interaction verification.
- Read back every touched file and verify tab indentation/no minified logic.
- Record planned vs actual delta and remaining work.

## Chess completion gate
Chess is complete only when correctness, strength evidence, UI usability, runtime stability, and touched-file review all pass. After that, repeat a lighter discovery-baseline-improve-verify loop for each remaining game in `geelooy/games/`, prioritizing broken/loading/mobile issues first.
