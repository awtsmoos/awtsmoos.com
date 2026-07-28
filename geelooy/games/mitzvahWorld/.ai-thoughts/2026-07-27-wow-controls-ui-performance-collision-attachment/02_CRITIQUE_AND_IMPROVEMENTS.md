B"H

# Second Pass: Critique and Improvements

## Why naive patches would fail

Adding mouse listeners directly to the canvas would duplicate existing input ownership and create stuck keys when pointerup lands outside the canvas. Rotating the model directly from mousemove would fight the camera/runtime orientation state. Making house floors thicker would hide the symptom while preserving terrain as the wrong ground authority. Reducing terrain detail would improve FPS by degrading quality, which is rejected. Reattaching only the staff would preserve inconsistent equipment ownership.

## Improvements

1. Trace the canonical input state first.
2. Create one desktop mouse chord state machine.
3. Normalize `buttons` bitmasks and explicit button transitions.
4. Release all transient input on blur and visibility loss.
5. Keep right-drag and left-drag semantics distinct.
6. Let both-button movement derive from camera forward projected onto ground.
7. Keep keyboard A/D as strafe regardless of mouse mode.
8. Preserve touch joystick behavior.
9. Put player yaw in one orientation controller.
10. Put camera orbit in one camera controller.
11. Add tests for lost pointerup recovery.
12. Add tests for context-menu suppression only during game interaction.
13. Inspect computed HUD layout before rewriting styles.
14. Use one responsive root class and safe-area variables.
15. Prevent side panels from obscuring the center reticle or controls.
16. Throttle noncritical HUD text updates.
17. Cache DOM references.
18. Avoid JSON/stringify diagnostics every frame.
19. Cache house support lookup by nearby house bounds.
20. Use floor support before terrain when inside house footprint.
21. Clamp large downward steps to the highest crossed support.
22. Add underground recovery only inside a valid support footprint.
23. Separate visible floor meshes from support authority.
24. Build one attachment registry per hydrated model.
25. Remove stale anchors before rebinding.
26. Keep slot-local transforms immutable.
27. Rebind all active slots after model hydration.
28. Add diagnostics for anchor count, generation, and slot parent.
29. Keep all files below 120 lines by splitting state, bindings, and policies.
30. Run coding first, testing after the whole rewrite.

## Risk graph

`pointer events -> mouse chord state -> camera/player orientation -> movement vector`

`HUD state -> DOM writes -> layout -> frame time`

`house footprint -> support sampling -> vertical integration -> underground bug`

`model hydration -> semantic anchors -> slot attachments -> visible equipment`

## Candidate files

Input/camera files, movement runtime, HUD/menu CSS and state modules, frame/update scheduler, house ground support modules, equipment anchor/attachment/runtime modules, plus focused tests. Exact files will be finalized after source inspection.
