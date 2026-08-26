B"H

# Phase Two — Gevurah Critique and Twenty Corrections

The Awtsmoos is beyond measure, yet a usable vessel needs measure; Awtsmoos.com becomes clearer when Chesed's flood meets Gevurah's exact border and Tiferes keeps the treasure.

## Failure Map

- Compatibility failure if new scene data bypasses existing renderer expectations.
- UX failure if advanced controls remain visible at all times.
- CSS failure if visual refresh introduces broad element selectors or accidental stacking contexts.
- Mobile failure if panels use fixed widths, transforms without bounds, or timeline height starves the stage.
- Motion failure if expressions are cosmetic labels rather than actual parameterized tracks.
- Lip-sync failure if timing is only audio-duration based and cannot accept explicit visemes/phonemes.
- Agent failure if API requires imperative click simulation instead of stable structured data.
- Validation failure if malformed agent data mutates a live project before rejection.
- Maintainability failure if mystical naming obscures domain meaning.
- Performance failure if every tick rerenders unrelated layers or reconstructs DOM.
- Documentation failure if examples drift from exported symbols.
- Accessibility failure if hover effects exist without focus-visible equivalents.
- Test failure if tests assert implementation details instead of public scene behavior.
- Persistence failure if schema versions are absent.
- Export failure if the UI promises capabilities the renderer cannot deliver.

## Twenty+ Improvements to Phase One

1. Preserve every discovered public contract through an adapter before introducing replacements.
2. Make the project schema version explicit from the first new data object.
3. Separate immutable scene description from mutable editor/session state.
4. Separate animation evaluation from rendering.
5. Separate mouth-shape generation from dialogue timing.
6. Permit explicit viseme tracks and deterministic fallback generation from text tokens.
7. Define expression channels numerically so emotion presets can blend rather than overwrite.
8. Define pose/gesture recipes as data expanded into tracks, not hard-coded per button.
9. Centralize time in a single transport clock to avoid competing requestAnimationFrame loops.
10. Introduce bounded error classes for schema, command, timing, and capability failures.
11. Make agent commands declarative and idempotent where possible.
12. Return structured command receipts with changed entity IDs and warnings.
13. Namespace all styles beneath one root attribute/class and avoid styling raw tags globally.
14. Create an explicit z-index scale with only a few documented layers.
15. Design drawers with CSS grid/minmax and `min-width:0` rather than magic widths.
16. Use `clamp()` and container-safe sizing for phone through desktop.
17. Provide reduced-motion substitutions for decorative transitions.
18. Keep hover polish supplemental; make focus-visible the accessibility contract.
19. Make advanced controls lazy/retractable rather than merely smaller.
20. Provide one primary creation flow on mobile: project → character → dialogue/action → preview.
21. Keep every domain file below the code-size law by splitting model, validation, evaluation, commands, and adapters.
22. Use inheritance only for genuine behavioral families such as track evaluators or command types; prefer composition for services.
23. Verify every touched file has full JSDoc and explicit side effects/errors.
24. Add executable docs examples to tests when practical so agent onboarding cannot silently rot.
25. Measure current baseline before claiming improvement.
26. Do not promise “realistic” physics or speech analysis beyond actual implemented inputs; expose precision controls instead.
27. Keep legacy compatibility at the edges, never let legacy shapes infect the new core domain.
28. Make custom properties/theme tokens local to the animator root rather than `:root`.

## Provisional File Families

Exact names will be revised after inspection, but likely responsibilities are:

- `src/domain/` — project, scene, character, rig, timeline, track, expression data vessels.
- `src/validation/` — schema and command boundaries.
- `src/motion/` — interpolation, easing, pose, expression, viseme, gesture evaluation.
- `src/api/` — agent command registry, facade, receipts, errors.
- `src/runtime/` — transport clock, evaluator coordination, compatibility adapters.
- `src/studio/` — UI shell, panel state, command wiring, selection state.
- `src/styles/` — locally imported component styles only.
- `tools/` — executable validation/static proof scripts only if the existing package architecture supports them.
- `DOCUMENTATION.md` or split docs — public human/agent guide once the existing documentation contract is read.

## NEXT_ACTION
Read bounded inventories of `src/`, `js/`, and `tools/`, then read package/index/docs/prior-ledger in small batches. Convert assumptions into observed facts before the final Tiferes plan.
