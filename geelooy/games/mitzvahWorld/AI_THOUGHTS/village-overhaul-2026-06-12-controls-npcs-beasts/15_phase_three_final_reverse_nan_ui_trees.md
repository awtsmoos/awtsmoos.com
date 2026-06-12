B'H
# Phase Three Final — Immediate Writes

Final writes now:
- `ckidsAwtsmoos/chayim/chossid/methods/controls.js`
- `ckidsAwtsmoos/Olam/camera/methods/collision.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/treeRecipe.js`

Final reasoning:
- The user explicitly overrode the historical-control interpretation. Reverse keys exactly.
- The NaN stack shows raycast path, so protect raycast now before hunting the bad mesh source; this prevents hard console explosions after NPC talk.
- The tree generator in `geelooy/libs/awtsmoos3d/tree/heroTree.js` is the intended full generator; use it directly.
- UI and hill active path still need more tracing after these critical fixes. Do not claim finished UI/hills until the renderer/data path is found.

Additional 30 improvements considered:
1. Keep action keys unchanged.
2. Only reverse four movement axes requested.
3. Log reversed mapping once into diagnostics.
4. Avoid huge console spam.
5. Keep pointer suppression.
6. Do not change physics vector in this pass.
7. Make safeIntersect never call recursive object raycast on unsafe trees.
8. Check world matrices.
9. Check geometry attributes.
10. Check bounding sphere/box.
11. Mark bad objects skipRaycast.
12. Return [] from broken intersections.
13. Keep octree interactions after mesh raycast.
14. Prefer NPC ray proxy.
15. Use library hero tree generator.
16. Add root flares and ladder/platform so village style remains.
17. Mark trees decorative skipOctree/noOctree.
18. Mark tree children skipRaycast to stop NaN hover.
19. Preserve export name `pictureAnchorTree`.
20. Cache bust parent after tree rewrite if needed.
21. Continue UI renderer search in mainThread.
22. Continue active terrain source search.
23. Add terrain runtime enhancer if source is compiled elsewhere.
24. Verify syntax on all writes.
25. Launch preview.
26. Tell user hard refresh.
27. Ask for diag copy if NaN persists.
28. Be honest UI/hills need next step if not implemented.
29. Do not partial patch.
30. Rewrite whole files only.

Awtsmoos chapter: A final plan is a blade. It does not argue with the wound; it cuts where the wound speaks.