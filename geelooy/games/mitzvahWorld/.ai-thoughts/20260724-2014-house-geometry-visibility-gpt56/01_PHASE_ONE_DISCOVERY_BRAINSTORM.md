# B"H
# Boruch Hashem
# Blessed is He

## Chesed brainstorm: every plausible cause

The Awtsmoos hides no triangle behind confidence; each hypothesis must become measured evidence.

1. Box indices may mix clockwise and counter-clockwise faces.
2. Vertex normals may disagree with index winding.
3. Exterior walls may be front-sided while the player views their back faces from indoors.
4. Interior partitions may require intentional two-sided visibility.
5. Roof and floor undersides may be legitimately back-facing and disappear when viewed beneath.
6. Materials may be frozen descriptors that later become shared mutable renderer materials.
7. A shared material may be mutated by `MinimalMeadowVisualStability.js`, masking construction defects.
8. Geometry may have null, absent, empty, or stale bounding boxes.
9. Geometry may have null, absent, empty, or stale bounding spheres.
10. Large world-space vertices may conflict with object-local frustum assumptions.
11. `setBaseTransform()` may snapshot stale matrices before attachment.
12. Parent groups may not update world matrices before culling.
13. Hidden negative scales may invert winding or bounds.
14. The renderer may cull by object position while vertices already contain world coordinates.
15. Door rebuilds may differ from static shell construction.
16. Visibility lifecycle code may remove or hide children during hydration.
17. Transparent textures or alpha policy may create apparent disappearance.
18. Coplanar floor, foundation, and terrain surfaces may z-fight.
19. Huge thin boxes may expose precision errors in sphere-only culling.
20. Bounds may be correct locally but transformed twice by identity-looking world matrices.
21. Draw ranges or index types may truncate geometry.
22. Index buffers may use the wrong scalar type for the runtime.
23. Material backface flags may not match the custom renderer's property names.
24. Frozen shared descriptors may prevent per-role sidedness.
25. Large wall boxes may need separate exterior and interior surface roles rather than universal double-sidedness.
26. Collision triangles may remain correct while rendering triangles are culled, creating invisible barriers.
27. Selection hints may survive even when render objects are absent.
28. Population cleanup may detach the group and later reuse stale references.
29. Bounding volumes may be calculated before all attributes or indices are installed.
30. The acceptance harness must orbit every house at several elevations and inspect eligibility, not screenshots.

## Evidence graph to build

`house definition -> primitive vertices/indices -> buffer geometry -> material contract -> mesh transform -> parent transform -> bounds -> frustum decision -> draw eligibility`

`same definition -> collision triangles -> octree -> traversal contract`

`foundation/floor/terrain elevations -> coplanarity distance -> depth-fighting risk`
