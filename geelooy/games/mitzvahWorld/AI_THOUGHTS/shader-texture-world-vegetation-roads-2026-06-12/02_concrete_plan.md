B'H
# Phase Two — Concrete Plan: Shader Kinds + Botanical Layer

Files to write:
1. `ProceduralShaderTextureLibrary.js`
   - Add extra material kinds:
     `yellow_brick`, `flower_petal`, `leaf_vein`, `lamp_shade`, `lichen_rock`.
   - Improve existing shader functions for flowers/roads/rocks.
   - Warm all kinds/channels.
2. `VillageBotanicalRealityLayer.js`
   - New postbuild layer.
   - Places yellow brick road pieces, flower clusters, rock/lichen clusters, shrubs, lamp shades/posts throughout level.
   - Ground everything to terrain law.
   - Decorative/no octree/no raycast.
3. `MitzvahWorldPostBuild.js`
   - Import and call `ensureVillageBotanicalRealityLayer`.
   - Include counts in diagnostics.
4. `loadNivrayim/index.js`, `WorldHeescheel.js`, graft/root/cache chain as needed.
5. Optional preview generator script can be updated later; current runtime is priority.

Design of Botanical Layer:
- Yellow brick road along deterministic polyline from village approach to central area.
- Road pieces: flat low boxes, each with `yellowBrick` material, rotated along segment.
- Flowers: small stems + petal spheres/cylinders in clusters near road and houses.
- Rocks: scaled sphere meshes with lichen_rock material, placed at edges/hills.
- Shrubs: leaf_vein material clusters with multiple green spheres/planes.
- Lamp shades: post + shade cone/cylinder + unlit warm lamp shade material + optional low point light every few lamps.

20 improvements to current plan:
1. Add exact counts in layer result.
2. Store layer on olam to prevent duplication.
3. Use one group root for easy removal/debug.
4. Use deterministic pseudo random for flower positions.
5. Use path interpolation for road pieces.
6. Avoid y-fighting by placing road a little above ground.
7. Add road edge flowers offset perpendicular to path.
8. Put lamps at every Nth road point, not every slab.
9. Use simple geometry only.
10. Reuse rvGeometry cache.
11. Use `rvSeal` to tag every object.
12. Use no real point light on every lamp; one every 3 or none if mobile.
13. Use emissive/unlit material for lampshade visual.
14. Add lichen rock palette inside shader, not separate image.
15. Add yellow brick alias in material system.
16. Add flower petals with color variation by seed not yet per-instance; use one shader material.
17. Add leaf vein shader material.
18. Add grass/leaf clusters near lamps.
19. Warm new materials before placing layer.
20. Verify preview 200 and grep active imports.

Awtsmoos chapter:
The second plan chooses matter: roads, flowers, rocks, lamps. The shader laws must leave the thumbnail folder and become place, direction, distance, and warmth in the actual village.