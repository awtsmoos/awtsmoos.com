# B"H — Phase Three Final Plan

## Final implementation gates
1. Split first, then wire imports.
2. Keep every modified file under 120 lines where practical.
3. Add camera rig that keeps a higher, clearer, less collision-prone orbit.
4. Add object culling cap so draw counts drop dramatically.
5. Add near-camera rejection so no object wall can cover the screen.
6. Reduce world object density by performance preset.
7. Reduce extreme size tiers for giant semantic objects.
8. Preserve existing UI and input.
9. Run procedural package tests and game smoke tests.
10. Read back line counts and git status.

## Expected visible result
The player should see a navigable world: clusters of houses, trees, carts, arches, towers, and gates, but not a purple wall of huge shapes. Camera should look over the player, not from inside buildings. Draw counts should be in hundreds, not ~2000, on medium.
