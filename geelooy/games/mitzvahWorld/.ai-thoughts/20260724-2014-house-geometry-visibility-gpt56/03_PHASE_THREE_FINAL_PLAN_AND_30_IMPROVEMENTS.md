# B"H
# Boruch Hashem
# Blessed is He

## Final execution plan

The Awtsmoos turns possibility into measured vessels; Awtsmoos.com will receive only evidence that survives readback.

1. Trace the custom mesh, material, bounds, matrix, and renderer culling implementation.
2. Trace primitive box vertices, indices, normals, UVs, and collider expansion.
3. Inspect existing house tests and test runner conventions.
4. Build a read-only reproduction that enumerates every house mesh and its renderer eligibility.
5. Determine the exact root cause and select the smallest local architecture.
6. Recheck claims and hash guards immediately before source writing.
7. Write complete new house-prefixed modules first.
8. Fully rewrite only the required claimed existing files.
9. Add focused world tests after code, as requested.
10. Run syntax, tabs, line limits, import resolution, focused tests, existing house tests, and a headless orbit contract.
11. Re-read all touched files, generate planned-versus-actual delta, and perform one complete refinement pass if needed.
12. Re-run every verification, record final hashes, Git scope, root cause, and handoff.

## Thirty additional refinements

1. Treat missing bounds as a contract failure, not a reason to disable culling.
2. Ensure bounds are finite and non-empty for every mesh.
3. Ensure spheres contain every transformed vertex.
4. Ensure boxes contain every transformed vertex.
5. Verify bounds remain stable across camera movement.
6. Verify world matrices remain stable across camera movement.
7. Verify parent matrices have positive determinants.
8. Verify no mesh toggles `visible` during orbit.
9. Verify no lifecycle path removes static wall children.
10. Verify material instances are not shared across conflicting side policies.
11. Verify exterior side policy matches outward winding.
12. Verify interior side policy supports both adjacent rooms.
13. Verify roof underside intent explicitly.
14. Verify floor underside intent explicitly.
15. Verify support/foundation intent explicitly.
16. Verify door panels retain dynamic rebuild behavior.
17. Verify mezuzah selection hints remain unchanged.
18. Verify room and stair counts remain unchanged.
19. Verify house dimensions and positions remain unchanged.
20. Verify collision triangle counts remain unchanged unless a proven defect requires otherwise.
21. Verify every visible solid definition has colliders.
22. Verify every collider remains aligned with the same authored world vertices.
23. Verify no geometry is translated twice.
24. Verify no bounds are translated twice.
25. Verify frustum decisions across 360 degrees and multiple radii.
26. Verify near-plane and far-plane edge cases.
27. Verify camera-above and camera-below cases.
28. Verify foundation/floor/terrain separation exceeds the depth epsilon.
29. Verify no test depends on screenshots or global stability overrides.
30. Verify `MinimalMeadowVisualStability.js` remains byte-identical.
31. Verify no source outside the exclusive scope changes.
32. Preserve all unrelated dirty work without reset, checkout, or formatting.
