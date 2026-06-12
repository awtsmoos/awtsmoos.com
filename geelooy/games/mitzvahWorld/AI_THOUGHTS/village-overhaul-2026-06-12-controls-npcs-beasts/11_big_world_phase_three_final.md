B'H
# Phase Three Final Plan

Final touch list now:
- `ckidsAwtsmoos/utils/AwtsmoosDiagnostics.js` new compact diagnostic ring.
- `ckidsAwtsmoos/Olam/camera/methods/update/index.js` full rewrite to suppress camera auto-input and camera orbit during UI/NPC capture.
- `ckidsAwtsmoos/Olam/methods/loadNivrayim/villageGrounding.js` full rewrite to use real TerrainMath and produce compact grounding diagnostics.
- `levels/ladder/source/village/sections/ProceduralTerrain.js` full rewrite bigger map + hills + roads/plateaus.
- `ckidsAwtsmoos/Olam/methods/loadNivrayim/index.js` full rewrite only to cache-bust new grounding and diagnostics if necessary.
- `GeneratedBattleLayer.js` maybe call `groundVillageNow` after mobs/decor install.

Final 30 checks/improvements:
1. Do not change W/S mapping; git says mapping was correct.
2. Make camera update stop auto-W if UI suppression active.
3. Camera must clear sentToOlam if suppression begins mid-drag.
4. Camera must zero mouse deltas on suppressed frame.
5. Diag helper must not spam.
6. Diag helper must expose copy function.
7. Diag helper must be safe in worker and browser.
8. Diag logs include build/version string.
9. Grounding uses TerrainMath.calculateHeightAt.
10. Grounding includes terrain law position offset.
11. Grounding includes static bounding box snap.
12. Grounding includes living setPosition snap.
13. Grounding scans scene for villageDecor/isVillageWildlife/etc.
14. Grounding excludes sky/camera/light/terrain itself.
15. Grounding outputs suspect floats only when delta > threshold.
16. Grounding report goes to diagnostics ring.
17. Grounding console.info only summary, not massive arrays.
18. Terrain width/depth enough for houses/mobs currently around +/-72 and future houses outside; choose 760x720.
19. Hills broad and gentle, not sharp.
20. Plateaus protect spawn and shops.
21. Roads flatten main route and branch routes.
22. Existing object coordinates remain valid.
23. Re-ground after battle layer install.
24. Choppy NPC: reducing camera suppression and logs helps.
25. Choppy NPC: NPC animation should not reset every frame; already guarded.
26. Add frame spike sampling in controls/update if possible.
27. Keep files syntax valid.
28. Cache bust grounding import.
29. Preview after write.
30. Final answer must say exact historical control proof and what to copy in future.

Awtsmoos chapter: The third plan stands like a mountain under the village. The old controls are not changed by panic; the terrain law is not guessed by nearest dot; the logs are not thunder but a scroll.