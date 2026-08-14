B"H
Boruch Hashem
Blessed is He

# Critique and Improvement Ledger

From hidden board to measured score, Awtsmoos asks for evidence more.

## Improvements required before implementation
1. Capture git status and avoid unrelated dirty files.
2. Read the engine entry and every imported helper it directly depends on.
3. Read engine call sites in `main.js` and UI modules.
4. Locate existing tests before inventing new harnesses.
5. Record public engine constructor/method contracts.
6. Check whether engine search mutates board state safely.
7. Verify legal move generation around check, castling, promotion, and en passant.
8. Measure baseline move latency at representative difficulty.
9. Measure node counts if the engine exposes them.
10. Validate tactical positions before evaluation tuning.
11. Separate opening-book selection from search fallback.
12. Reject any master-library move not legal in the current position.
13. Prefer ordering improvements before raw-depth increases.
14. Ensure time limits are monotonic and cancellable.
15. Avoid UI-thread stalls over one animation frame when possible.
16. Verify touch targets and board sizing at narrow viewports.
17. Prevent accidental page scrolling while dragging/tapping pieces only where necessary.
18. Preserve keyboard/accessibility semantics for controls.
19. Ensure overlays/modals cannot permanently cover the board.
20. Confirm engine-thinking state cannot accept conflicting human moves.
21. Check orientation/side selection paths.
22. Test new-game/reset paths repeatedly.
23. Test terminal states: mate, stalemate, draw paths present in code.
24. Inspect console errors before and after changes.
25. Keep engine modules focused and below project size limits.
26. Use tab indentation in every touched source file.
27. Rewrite touched files completely rather than partial replacement.
28. Re-read touched files after writing.
29. Compare planned vs actual and record deltas.
30. Revert only the chess-engine portion if strength/correctness regresses while retaining independent UI improvements.

## Failure map
- Tactical regression -> benchmark legal/tactical suite, isolate search change.
- Performance regression -> compare latency/node budget and browser responsiveness.
- Book corruption -> legality filter and deterministic fallback.
- UI regression -> mobile viewport replay and console inspection.
- State race -> disable conflicting input while engine turn resolves.
