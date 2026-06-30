B"H
# Phase Three — Improvements Over The Plan

1. The overlay will use one primary action, not two visually equal buttons.
2. Restart remains visible but smaller.
3. Buttons receive big labels and tiny descriptive captions.
4. Pulse is named “PULSE / OHR” so mechanics are readable.
5. Touch joystick gets a “DRAG TO MOVE” label.
6. The HUD message becomes the main instruction rail.
7. The minimap uses glow colors for edible versus dangerous objects.
8. High perf becomes “Extreme” but still stores as `high` for save compatibility.
9. All keyboard shortcuts remain discoverable.
10. Danger has cooldown so collisions do not instantly melt the run.
11. Score penalty and time penalty make the game harder without feeling random.
12. Targets and timers scale per world.
13. Player speed floor stays high so growth does not become mud.
14. JSDoc comments are placed at module and function boundaries.
15. CSS is split by responsibility.
16. UI rendering is split from UI event binding.
17. Input is split by input device.
18. Game step is split by gameplay concern.
19. State construction is split from visual particle helpers.
20. Smoke tests assert no non-finite render commands.
21. Smoke tests assert draw command ceilings.
22. Smoke tests assert hazard penalties work.
23. Debug vessel remains available as `window.nitzotzDebug`.
24. The version query changes to bust browser cache.
25. The code avoids adding dependencies.
26. Existing WebGL renderer remains stable.
27. Existing save data remains readable.
28. The UI hides overlay only while playing.
29. Victory overlay becomes a next-world gate.
30. Loss overlay becomes a retry gate.
