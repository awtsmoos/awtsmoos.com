B"H

# Fix All Remaining Executor Issues Plan

Chapter: The Awtsmoos reveals the remaining sparks through exact tests, not guesses.

## Guardrails
- Do not modify original app/game source files.
- Only modify tunnel, tunnel-control, Merkava executor/runtime, and AI_THOUGHTS test harnesses.
- Kill stale smoke/matrix processes before trusting any JSON file.
- Every fix must be verified by a focused test and then by a broader matrix.

## Known state before this pass
- Runtime all-HTML matrix: 67/70 passing.
- Remaining rows:
  1. geelooy/games/tests/2/index.html: missing Nodes.js path.
  2. geelooy/games/tests/3/index.html: classic script expects global THREE.
  3. geelooy/games/tests/tree/index.html: page-local animate scoping issue.
- Puppeteer smoke: first 10/67 direct-service smoke rows passed, but stale previous runners exist.

## Work list
1. Kill stale puppeteer smoke and matrix runners.
2. Inspect the three failing pages and classify/fix executor-owned issues only.
3. For tests/3, support real local classic-script THREE global by loading real module and exposing a global namespace when a classic script URL maps to local three.module.js.
4. For tests/2, inspect whether a real Nodes.js equivalent exists; if absent, classify as source missing, not executor failure.
5. For tests/tree, inspect if the page truly calls animate before definition; if so classify source bug unless executor transform created the issue.
6. Complete Puppeteer smoke for all 67 runtime-passing pages with direct-service runner.
7. Run syntax checks on edited files.
8. Run boundary audit.
9. Save final report JSON.
