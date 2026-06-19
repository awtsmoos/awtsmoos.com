B"H

# Actual Write Plan

The root visible failure is not just camera values. The stage itself can still expose cleared transparent canvas/black CSS because the scene is under `camera_world`. Therefore this pass writes two safety layers:

1. `FrameClearPhase.js` fills a warm wall/floor canvas before graph rendering. This alone kills black void.
2. `StageLayerComposer.js` adds screen-space room fallback nodes outside the camera, then renders camera_world over it.

Then the default scene must match the goal more honestly:

3. Two main bearded/hat male sage characters instead of child-like generic figures.
4. More stable two-person dialogue framing.
5. Better accessories through `StableAccessories2D.js`, mounted on the head axis.
6. Verification updated for screen fill, accessories, default scene identity.

