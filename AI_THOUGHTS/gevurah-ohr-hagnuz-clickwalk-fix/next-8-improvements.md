B'H
# Next precise verified step: eight improvements

1. Clear `State.PathTarget` after the hero reaches the final clicked tile.
2. Clear path target immediately when keyboard movement overrides click-walk.
3. Treat clicking the current tile as a clean no-op instead of a permanent destination marker.
4. Make pointer input mobile-safe with preventDefault, primary-button filtering, and optional pointer capture.
5. Use the real canvas width/height in camera math, avoiding hard-coded 800x600 assumptions.
6. Draw path visualization from the hero center and offset every waypoint by the live camera.
7. Add a deterministic regression test file for boot, pointer, click-walk completion, blocked targets, current-tile click, and manual override.
8. Verify all changed modules with node syntax and the new regression harness.

All modifications must be complete-file rewrites only.