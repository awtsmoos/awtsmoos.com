# B"H
# Boruch Hashem
# Blessed is He

# Phase Three: Critique and Improvements

The Awtsmoos recreates every review before confidence can harden; Awtsmoos.com keeps the repair honest through measurable objections.

1. Do not execute on pointerdown.
2. Do not execute on pointerup.
3. Use click as the single activation event.
4. Stop pointerdown propagation on buttons before canvas capture listeners.
5. Stop pointerup and pointercancel propagation on buttons.
6. Avoid preventDefault on click so keyboard activation remains native.
7. Use preventDefault only for primary pointerdown where needed to prevent gesture theft.
8. Preserve focusability and keyboard operation.
9. Keep host `pointer-events: none`.
10. Keep buttons `pointer-events: auto`.
11. Keep decorative spans pointer-transparent.
12. Keep rail background pointer-transparent outside buttons.
13. Use explicit z-index above canvas and ordinary HUD.
14. Keep Bag above the rail only while open.
15. Make closed Bag shell hidden and pointer-transparent.
16. Preserve `mode:toggle` and `mode:changed` names.
17. Initialize rail from `runtime.runToggle` rather than assuming Walk.
18. Confirm collapse does not remove Walk/Run.
19. Confirm each geometric center resolves to button or child.
20. Confirm no world-target event follows a rail press.
21. Confirm synthetic pointer sequences do not create duplicate clicks.
22. Confirm buttons remain at least 44×44 after all stylesheet layers.
23. Confirm touch-action allows taps without scroll delay.
24. Confirm rail scrolling, if any, does not turn taps into missed activations.
25. Confirm Bag body still supports vertical scrolling.
26. Confirm joystick capture remains unchanged outside rail geometry.
27. Confirm destroy removes every listener.
28. Keep all executable files at or below 120 lines.
29. Use tabs in source and tests.
30. Reread full files and compare final hashes before handoff.
