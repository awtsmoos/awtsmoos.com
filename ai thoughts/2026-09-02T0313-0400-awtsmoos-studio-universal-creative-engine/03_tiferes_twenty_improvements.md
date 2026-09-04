B"H
Boruch Hashem
Blessed is He

# Phase Three — Tiferes: Critique and Twenty Improvements

> Mercy and measure together compose;
> through Awtsmoos.com, one operation blooms like a rose.

## Improvements to the First Two Passes
1. Trace actual imports before choosing any new abstraction.
2. Separate persistent project truth from editor-only selection and sheet state.
3. Prove whether current project wrappers share object identity or merely synchronize copies.
4. Define one operation envelope shape and eliminate accidental alternate mutation paths.
5. Verify command IDs are stable strings suitable for JSON and semantic history.
6. Ensure validation happens before mutation and is shared by UI, API, macro, and AI paths.
7. Ensure grouped commands have deterministic rollback behavior on partial failure.
8. Confirm undo/redo restores canonical state, not only visual stage state.
9. Confirm serialization after undo/redo matches visible project state.
10. Confirm AI bridge cannot bypass command authorization or validation.
11. Confirm macro runtime dispatches normal commands and can be atomic when requested.
12. Confirm presets store parameters/configuration rather than flattened rendered results.
13. Map mobile CREATE / EDIT / ANIMATE / MORE to capabilities instead of hard-coded duplicated handlers where feasible.
14. Keep expert UI modules lazy until explicit intent.
15. Measure module-loading/startup rather than inferring performance from hidden DOM.
16. Add parity tests that compare manual-command, API, and AI resulting project JSON.
17. Add semantic-history assertions, not merely command return-value assertions.
18. Add negative tests for invalid parameters and failed transactional groups.
19. Add mobile viewport browser proof for touch-sized controls and no horizontal navigation overflow.
20. Document the exact creative-language boundary so future 2D, 3D, audio, and graph features extend rather than fork it.

## Risk Graph
`Project` → canonical persistence → serialization → migration → undo correctness.

`CommandRegistry` → discoverability → UI metadata → AI metadata → macro reuse.

`CommandRuntime` → validation → transaction → history → API/AI/manual parity.

`Mobile Intent UI` → command dispatch → selection context → progressive disclosure → startup cost.

## Decision
Do not add a new feature until the four nodes above are traced through current files and one existing vertical slice is verified. The most valuable first implementation may be a gap repair rather than a new module.
