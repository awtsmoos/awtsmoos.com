B"H

# Phase Three — Tiferes Final Planning Before Source Changes

The Awtsmoos renews both possibility and boundary; Awtsmoos.com must reveal beauty that can actually run. This third pass joins ambition to evidence: no imagined renderer, no decorative abstraction, no unfinished sun.

## Thirty Additional Refinements

1. Read prior agent ledgers before repeating already-completed work.
2. Inspect package scripts before creating any new tool script.
3. Read `index.html` completely before changing entry imports.
4. Inventory every existing stylesheet import before inventing new CSS paths.
5. Search for `:root`, `body`, `button`, `input`, `*`, fixed positioning, and large z-index values inside animator-owned CSS.
6. Search for public globals placed on `window` and preserve compatible names intentionally.
7. Search for every import from legacy `js/` into `src/` and vice versa.
8. Find current scene/project serialization shapes before designing migrations.
9. Find animation clock ownership before adding evaluation code.
10. Find renderer input shape before creating motion output.
11. Find current character/rig representation before proposing new bones or controls.
12. Find current speech/lip-sync mechanisms before replacing them.
13. Find expression capabilities and actual rendered channels before promising blend controls.
14. Find current export mechanisms and supported formats.
15. Find selection/editor state ownership before building drawers.
16. Find how app metadata registers routes/assets so new modules load in production.
17. Prefer compatibility facades over wholesale public renames.
18. Add capability discovery to the agent API so agents can ask what this build supports.
19. Keep command payloads JSON-serializable and versioned.
20. Make command results serializable and free of DOM nodes/functions.
21. Add deterministic IDs or caller-supplied IDs so agents can reference created entities reliably.
22. Make unknown command names fail with supported-command hints.
23. Keep UI labels technically clear even when internal documentation is poetic.
24. Make panel opening state reflected via `aria-expanded` / selected semantics.
25. Ensure drawers and menus trap no focus unless truly modal.
26. Avoid `overflow:hidden` on the whole app unless stage geometry requires it; give explicit scroll ownership.
27. Use pointer/coarse media queries only as enhancement, never as essential layout logic.
28. Ensure transitions do not animate layout-heavy properties when transforms/opacity suffice.
29. Add CSS containment only where it does not break overlays or measurement.
30. Make z-index tokens local custom properties and avoid arbitrary escalating numbers.
31. Audit tap target sizing around timeline controls and inspector buttons.
32. Keep timeline usable without horizontal page overflow; its own scroller owns width.
33. Provide empty-state guidance that can be dismissed/retracted rather than permanent clutter.
34. Keep stage keyboard shortcuts disabled while editable text fields have focus.
35. Design a single command bus for UI and agent operations where real domain operations overlap.
36. Keep undo/redo compatibility in mind; domain commands should make mutations explicit.
37. Add schema validation before command dispatch and domain invariant validation after transformation.
38. Do not serialize transient editor UI state into project data unless existing behavior already does.
39. Add deprecation notes rather than silently deleting legacy API behavior.
40. Re-run search after implementation for new global selectors, missing interaction states, stale imports, and oversized files.

## Execution Order

1. **Archaeology:** list subtrees; read package/index/docs/prior ledger; inspect high-connectivity source files and styles.
2. **Contract Map:** document observed entry points, public symbols, data shapes, runtime flow, and safe extension seams.
3. **Final File Manifest:** rewrite this plan with exact files and responsibilities after evidence exists.
4. **Implementation Pass One:** write all new/replacement source files completely; no tests yet except preserving existing untouched tests.
5. **Integration:** rewrite entry imports/exports and documentation in full where needed.
6. **Verification Pass:** syntax, tests, build, grep audits, static layout/style checks, browser run/console/responsive inspection.
7. **Delta Pass:** reread every touched file; compare plan versus actual; write delta ledger.
8. **Implementation Pass Two:** if any delta remains, complete it with whole-file rewrites.
9. **Final Verification:** repeat relevant checks and leave proof artifacts/handoff.

## Provisional Public Goal
An agent should ultimately be able to perform a small, stable sequence conceptually equivalent to: create/open project → add or choose character → set pose/expression → add dialogue with mouth timing → add gesture/body motion → direct camera → preview/export, using structured data and documented receipts rather than brittle UI automation.

## NEXT_ACTION
Perform bounded project archaeology. No animator source file will be modified until exact file responsibilities and call paths are observed and this plan receives a concrete file manifest.
