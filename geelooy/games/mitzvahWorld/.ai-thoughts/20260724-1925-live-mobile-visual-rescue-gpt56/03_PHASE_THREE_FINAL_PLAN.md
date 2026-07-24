# B"H
# Phase Three — Final Implementation Order

1. Rewrite `MinimalMeadowFeatureReceipts.js` to use `featureNow`.
2. Rewrite `MinimalMeadowGameRail.js` so the full rail is initially visible.
3. Add world-UV helper and apply it to terrain and road geometry.
4. Rewrite terrain composites to mix several full-resolution families into both ground and road sources.
5. Rewrite road ribbon with world-space UVs, mixed shoulder material, stable offset, and diagnostics.
6. Rewrite terrain package and mesh integration to use physical UV density without shader-dependent repetition.
7. Rewrite quest NPC population and rich-world mount to await a canonical GLB quest actor.
8. Rewrite weapon factory so every staff/sword part renders in bootstrap and rich paths.
9. Rewrite player-action actor to compose from immutable captured bind quaternions.
10. Rewrite bootstrap color renderer to neutralize vertex colors when the material opts out.
11. Add a post-mount visual stability system for house sidedness/culling, road visibility, demon maps, and equipment synchronization.
12. Integrate stability after rich-world settlement.
13. Only then write and run focused tests, simulation, import checks, and live runtime inspection.
