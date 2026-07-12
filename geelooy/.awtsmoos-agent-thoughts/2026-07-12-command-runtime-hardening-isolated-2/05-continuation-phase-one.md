# B"H — Continuation Phase One: Verification Before More Change

## Current boundary

The installed tunnel remains unchanged. Repository source contains an isolated command kernel and an in-progress production entrypoint split. The most recent apparent worker-shape failure was caused by an invalid inspection call to a nonexistent `stopAll` method; the supervisor's actual `status()` result uses a bounded active-worker object.

## Immediate proof sequence

1. Load `main.js` without starting the agent.
2. Stop only the lag monitor created by the imported module.
3. Confirm worker details are visible and bounded.
4. Confirm all `main-*` modules and `main.js` are under 120 lines.
5. Run syntax checks over every touched JavaScript file.
6. Run the previously failing worker-stats test alone.
7. Run the full standalone compatibility matrix, one test per Node process.

## No-live rule

No copy, installer, process replacement, supervisor restart, or live state migration is allowed during this phase.
