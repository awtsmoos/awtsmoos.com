# B"H
# Boruch Hashem
# Blessed is He

## Twenty improvements after critique

1. Do not edit shared tiny runtime.
2. Do not edit canonical procedural-core.
3. Cache geometry by preset and detail.
4. Share bark and leaf materials across every tree.
5. Use only two draw-call meshes per tree.
6. Reject empty core buffers explicitly.
7. Preserve Uint16 indices when possible and Uint32 only when required.
8. Preserve normals, UVs, and leaf vertex colors.
9. Mark leaf materials MASK rather than transparent blend.
10. Hide leaf mesh until a real/fallback alpha texture exists.
11. Keep deterministic golden-angle yaw and candidate order.
12. Bound mobile population without changing accepted placement coordinates.
13. Keep trees out of roads, water, homes, and spawn.
14. Derive repeats independently for non-square sources.
15. Clamp repeat counts by quality profile and renderer limit.
16. Report effective pixels per world unit for both axes.
17. Keep cobblestone generation deterministic and cached.
18. Keep road shoulders dirt-biased and center stone-biased.
19. Ensure failure fallback remains bright dirt, never a white material or fake tree.
20. Test source-code authority so metadata cannot lie again.
21. Confirm no per-frame geometry or material allocation.
22. Preserve current asynchronous rich-world boot.
23. Avoid touching dirty orchestration files.
24. Use hash-guarded full-file rewrites.
25. Record all unresolved acceptance items owned by other workers rather than editing across claims.
