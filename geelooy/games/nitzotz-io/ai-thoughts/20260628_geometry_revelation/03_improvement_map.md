# B"H — Improvement Map

## Issues to prevent
1. Broken normals producing flat or black surfaces.
2. Degenerate geometry with NaN or oversized coordinates.
3. Semantic shapes that map to cubes only.
4. Duplicate hardcoded procedural logic spread across game and library.
5. Renderer unable to validate mesh counts before upload.
6. Browser import paths accidentally broken by raw ES modules.
7. Tests proving only cubes but not the full shape catalog.
8. Arch/ring/letter/star shapes visually too primitive to communicate the game world.
9. Object scale semantics fighting mesh dimensions.
10. Future contributors not knowing why the procedural package exists.

## Improvements selected
- Convert procedural indexed mesh data into interleaved triangle buffers.
- Add `meshToTriangles` with computed normals.
- Add transform helpers and merge helpers that preserve colors.
- Add a procedural catalog with cube, disc, plane, sphere, ring, cylinder, star, letter, arch, tree, cloud, gate, and shard.
- Keep the game renderer contract stable.
- Add tests that inspect every catalog mesh.
