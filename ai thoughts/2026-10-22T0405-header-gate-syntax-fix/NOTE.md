# CLAIM — header-gate syntax-contract fix lane (2026-10-22 ~04:05 EDT)

Claiming ONE file: scripts/homeVerification/homeSyntaxContract.mjs
WHAT: fix verifyHomeSyntax — it runs node --check (CommonJS parse goal) on ESM files
(geelooy/scripts/home-simple/index.js etc., no type:module scope anywhere), so
bhRelease pre-flight verifyHomeSource dies deterministically (exit 1) on a clean tree.
FIX: keep node --check first (CJS behavior unchanged); on failure retry with the
module parse goal via a temp .mjs copy. Broken files still fail both parses.
NOT touching: release files, reader, geelooy/apps/tunnel/**, any sibling dirty files.
When done: single commit on main, this note + TOOLING-FIX record in ~/workspace/header-gate/.

DONE 2026-10-22 ~04:1x EDT: fixed + committed on main. verifyHomeSource now exits 0
(was exit 1 at this contract). Teeth proven: broken ESM + broken plain files still
fail with AssertionError; valid CJS / ESM / top-level-await / with-statement verdicts
unchanged-or-correct. Record: ~/workspace/header-gate/TOOLING-FIX.md (VM workspace).
