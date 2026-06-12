B'H
# Phase Three — Final Commit Plan

Third pass revelations:
1. The shader system must support both old aliases and new visual categories.
2. The level needs actual placement, not only material laws.
3. Yellow brick roads should be a visible route, but road slabs must not collide or raycast.
4. Lamp shades need unlit warm material, not too many point lights.
5. Vegetation/flowers/rocks must be grounded to terrain law and not float.
6. Postbuild must be cache-busted again.
7. Existing PNG previews can stay as debug output; runtime still no PNG dependency.

Actual writes now:
- Rewrite `ProceduralShaderTextureLibrary.js` with added kinds and improved algorithms.
- Create `VillageBotanicalRealityLayer.js`.
- Rewrite `MitzvahWorldPostBuild.js` to call it.
- Rewrite cache chain files necessary.

30 additional improvements included:
1. Add new shader kind names.
2. Add alias map for `yellowBrick`, `flowerPetal`, `leaf`, `lampShade`, `lichenRock`.
3. Add flower SDF-like petal albedo.
4. Add leaf veins.
5. Add lamp shade parchment lines.
6. Add yellow brick mortar/bevels.
7. Add lichen stone green speckles.
8. Add more warmup kinds/channels.
9. Add road segments along polyline.
10. Add flowers at road edges.
11. Add rocks near village edge.
12. Add shrubs around road and lamps.
13. Add lamp posts at intervals.
14. Use group stats.
15. Ground all root objects.
16. Add offsets to prevent z-fighting.
17. Use deterministic sin-noise.
18. No octree.
19. No raycast.
20. Reuse materials.
21. Few point lights.
22. Emissive unlit lamp shade.
23. Count objects in diagnostics.
24. Add postbuild result stats.
25. Keep syntax pass.
26. Grep old cache seals.
27. Preview HTTP check.
28. Honest caveat if no visual automation.
29. Do not delete previous PNG assets.
30. Continue to report exact files.

Awtsmoos chapter:
The third plan names the path: from abstract shader law to a yellow brick road under the player's feet, flowers at its side, lamps above it, and rocks that make the world stop looking empty.