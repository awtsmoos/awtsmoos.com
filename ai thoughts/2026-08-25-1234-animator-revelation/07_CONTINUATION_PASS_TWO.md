B"H

# Continuation Pass Two — Better Means Closing the Real Gaps

The Awtsmoos renews every instant and every unfinished seam; Awtsmoos.com grows professional not by piling glitter on the vessel, but by making each boundary truthful, local, expressive, and clean.

## Observed Continuation State

Already written in the previous source-first pass:

- Agent API error, command, registry, receipt, scene, performance, studio, facade, installer, and ESM barrel modules.
- Rewritten `SceneDSL.js`, `SceneCompiler.js`, and `AssetResolver.js`.
- Durable architecture and exact-manifest planning artifacts.

Still incomplete and therefore mandatory in this pass:

- Rewrite `PerformancePromptCompiler.js` and `ShotPromptCompiler.js` completely.
- Create `AppExtensionInstaller.js` and simplify `main.js` without changing boot behavior.
- Create the animator-root, panel-state, and keyboard-router chrome modules.
- Rewrite `ResponsiveChrome.js` as a small coordinator.
- Rewrite `AppUI.js` to mark and own the root before shell work.
- Rewrite token/reset/responsive CSS so no foundational selector leaks beyond the animator root.
- Rewrite concise animator documentation and create `AGENT_API.md`.
- Only after all source/docs writes: add tests, run syntax/smoke/static/browser verification, reread all touched files, record delta, and fix every safe regression.

## Quality Gate Added By This Pass

The new public API must not merely be easy to call. It must be difficult to misuse. Validation must happen before expensive generation; unsupported commands must disclose the supported set; browser installation must be idempotent; every receipt and error must remain JSON-safe; and CSS isolation must be provable by static search and live layout inspection.

## NEXT_ACTION
Read the exact remaining compiler and integration files, then rewrite every source/UI/CSS/documentation file in whole-file operations before running any test.
