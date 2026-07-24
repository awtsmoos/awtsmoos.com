# B"H
# Boruch Hashem
# Blessed is He

# Phase Three — Critique and Thirty Improvements

The Awtsmoos recreates every coordinate before it can become stale; Awtsmoos.com therefore challenges the design from thumb, keyboard, camera, collision, animation, accessibility, and integration at once.

1. Keep raw joystick X positive to the screen-right.
2. Correct the mathematical basis, not the visual knob.
3. Preserve actor-relative Q/E strafing.
4. Preserve A/D turning direction.
5. Preserve W/S forward and backward.
6. Normalize diagonals to one speed ceiling.
7. Return zero for missing or degenerate camera targets.
8. Use fallback facing when the camera direction collapses.
9. Avoid allocating geometry, materials, or listeners per frame.
10. Keep movement functions pure and directly testable.
11. Remove query-string identities from connected movement imports.
12. Distinguish selected run mode from temporary Shift override.
13. Make the controller snapshot expose selected and effective modes.
14. Keep runtime `state.runMode` as effective animation truth.
15. Make mobile joystick honor the selected persistent mode.
16. Make keyboard movement honor the selected persistent mode.
17. Keep Shift as a temporary run accelerator without changing the selected label.
18. Put the visible mode button on the right rail, not a hidden modal.
19. Use `type=button` to prevent accidental form submission.
20. Use `aria-pressed` to expose current mode.
21. Update icon, text, title, and active dataset together.
22. Subscribe once to `mode:changed` and unsubscribe on destroy.
23. Keep the mode control independently usable when secondary rail actions collapse.
24. Preserve at least the existing button hit-area styling.
25. Keep collapse behavior and diagnostics bounded.
26. Test right, left, forward, backward, and both diagonal signs.
27. Test camera-relative direction after a rotated camera view.
28. Test walk and run distances over equal delta time.
29. Test action state changes from walk to run.
30. Test rail emission, visible state, accessibility state, and cleanup.
31. Verify release returns joystick vector to zero through the unchanged joystick contract.
32. Run syntax checks on every touched JavaScript module.
33. Scan reachable imports for duplicate query identities.
34. Check tabs and full-file line counts.
35. Reread and hash every output before browser testing.
36. Store screenshots and logs only outside Git.
37. Test desktop once after the coherent pass.
38. Test 390×844 mobile once after the coherent pass.
39. Batch all observed failures into one refinement rewrite.
40. Rerun final acceptance and close browser processes.
