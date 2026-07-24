# B"H
# Boruch Hashem
# Blessed is He

## Gevurah architecture

The repair should remain local to house construction. A focused house geometry policy module may:

- classify surface intent;
- clone material descriptors per role;
- assign intentional side policy;
- compute explicit local/world bounds from authored definition data;
- update matrices before draw eligibility is inspected;
- attach immutable visibility evidence to each mesh.

`MinimalMeadowHouseShell.js` should preserve every dimension and identifier while emitting explicit surface roles. `MinimalMeadowHouseMaterials.js` should return independently owned role descriptors rather than shared mutable vessels. `MinimalMeadowHousePopulation.js` should apply the local mesh contract after assembly and expose diagnostics without disabling frustum culling.

Potential new modules:

- `MinimalMeadowHouseSurfacePolicy.js`
- `MinimalMeadowHouseGeometryContract.js`
- `MinimalMeadowHouseVisibilityDiagnostics.js`

Potential focused tests:

- `minimalMeadowHouseGeometryContract.test.mjs`
- `minimalMeadowHouseOrbitVisibility.test.mjs`
- `minimalMeadowHouseCollisionVisibilityParity.test.mjs`
- `minimalMeadowHouseDepthSeparation.test.mjs`

## Twenty improvements over the first brainstorm

1. Read the exact custom renderer before choosing Three.js property names.
2. Prove box winding face by face with signed normal dot products.
3. Test both indexed and expanded triangle representations.
4. Record bounds before and after matrix updates.
5. Distinguish world-authored vertices from object-local vertices.
6. Reject negative determinant transforms explicitly.
7. Keep `frustumCulled` enabled for house meshes.
8. Use role-specific sidedness rather than blanket double-sidedness.
9. Make exterior wall intent different from interior partition intent when renderer supports it.
10. Make floors and roofs visible from intentionally reachable viewpoints beneath them.
11. Clone descriptors before attaching per-surface policy.
12. Preserve texture URLs, repeats, colors, and loaded images exactly.
13. Preserve door, mezuzah, stairs, room, and collider identifiers.
14. Inspect every mesh after complete parent attachment.
15. Test all house profiles, not only Beis Ohr.
16. Orbit at low, eye, roof, and underside elevations.
17. Calculate camera-to-bounds eligibility analytically without screenshot dependence.
18. Compare visible definitions with collider definitions by stable IDs.
19. Measure vertical separation among terrain, foundation, and floor surfaces.
20. Abort source rewrite if any claimed hash changes.
21. Run syntax, tabs, line-limit, import, focused, and existing house tests.
22. Re-read every written file and compare planned versus actual behavior.
