<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Session Continuation Protocol

This file exists so any future ChatGPT/agent session can continue safely without relying on conversational memory.

## Before editing

1. `cd /Users/awtsmoos/work/awtsmoos.com`.
2. Read `PLAN_INDEX.md`, `CURRENT_STATE.md`, and `TASK_LEDGER.md`.
3. Find the single `[>]` task. If none exists, choose the first dependency-ready `[ ]` task and change it to `[>]`.
4. Read that task's phase file.
5. Run targeted `git status --short -- <paths>`.
6. Read each existing target file immediately before modification because other agents may have changed it.
7. Never use reset/clean/checkout to discard unrelated work.

## During implementation

- Prefer reusable shared primitives over product-specific duplication.
- Keep browser, Geelooy OS, Tunnel, CLI, and ChatGPT as clients of the same authoritative APIs.
- Server determines financial/resource costs; browsers never self-report authoritative billable usage.
- Production publication must be immutable/revisioned; editable source is not production truth.
- Preserve existing authorization instead of creating privileged alternate storage or cookie export paths.

## Before marking a task complete

Run the task-specific tests plus:

- syntax checks for every touched JS/MJS/CJS file;
- line count check for touched authored JavaScript;
- blessing-header check;
- indentation/minified-source sanity check;
- `git diff --check` on the targeted slice;
- targeted Git diff review for concurrent edits.

Only then change `[>]` to `[x]` and move `[>]` to the next dependency-ready step.

## Before ending any session

1. Update `CURRENT_STATE.md` with verified facts only.
2. Update `TASK_LEDGER.md` statuses.
3. Record exact failing tests/blockers if any.
4. Record exact next files/commands.
5. Never say production is live unless the production URL/API was actually verified after deployment.
6. If Remote Desktop becomes unreliable, stop risky writes and leave the ledger pointing at the last known-safe step.
