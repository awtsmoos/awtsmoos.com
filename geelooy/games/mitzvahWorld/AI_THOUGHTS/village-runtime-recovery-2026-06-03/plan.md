B"H
# Village runtime recovery plan

## Live symptoms from phone screenshots
1. Player immediately falls through / into abyss.
2. Console says `Souls materialized... Auto-grounded 0/0; skipped 30; villageRay=true`, then player falls.
3. Console shows WebGL errors: `GL_INVALID_ENUM: glTexStorage2D internalFormat was GL_ALPHA` and `GL_INVALID_OPERATION: glTexSubImage2D level 0 does not exist`.
4. Trees are visible as bare branch/trunk silhouettes with no leaves.
5. Sky is unattractive compared to reference.
6. Roofs overlap / tile courses look wrong.
7. Flowers still look like blocky pixels/cubes and are too sparse.

## Likely causes to verify
1. Terrain collision: the new terrain mesh may be visually present but either:
   - not inserted into worldOctree after geometry changes,
   - inserted before matrix/geometry are stable,
   - too sparse/oddly bounded for player capsule collision,
   - or the player starts above a place where terrain octree triangles are missing.
2. Tree leaves/WebGL: my `VillageTreeField` used `THREE.AlphaFormat` DataTexture as alphaMap. Mobile WebGL reports `GL_ALPHA` invalid for `texStorage2D`, so leaves fail and the texture becomes non-renderable.
3. Sky: my sky adds sprites, but the color/shape is not close enough and cloud/sun sprites may be visually awkward.
4. Roof overlap: repeated roof strips/tile rows likely intersect roof slabs and create bad moire/overlap, especially after three houses.
5. Flowers: instanced PlaneGeometry blossoms are still too flat/small/blocky; need simple crossed petal planes or low-poly flower sprites, not cubes.

## Concrete fix order
### Phase 1: stop falling
- Read `ProceduralTerrain.js`, `TerrainGeometryEmanator.js`, `OctreeWorld.addObject`, and player spawn/collision logic.
- Add robust terrain metadata and verify `worldOctree.addObject(this.mesh)` is actually called after `updateMatrixWorld(true)`.
- If needed, add a separate simple invisible terrain collider mesh with safe segments, same height algorithm, and only that collider enters octree.
- Keep visual terrain decorative-ish only if the collider exists; do not add trees/flowers/rocks/roofs to octree.

### Phase 2: fix WebGL leaf errors
- Remove `AlphaFormat` textures.
- Use RGBA DataTexture for leaves or no texture at all, with vertex colors and transparent material.
- Prefer generated leaf quads from `TreeGenerator`, instanced branch mesh and instanced leaf mesh.
- Verify no `AlphaFormat` remains in village tree/sky code.

### Phase 3: sky cleanup
- Simplify sky: gradient dome + fog + warm directional/hemi light.
- If using clouds, use RGBA DataTexture only and few distant soft sprites.
- Avoid lens-flare excess.

### Phase 4: roof cleanup
- Rewrite roof recipe to use fewer non-overlapping roof slabs/rows.
- Make roofs consistent with reference: simple brown shingles, no strip fighting.

### Phase 5: flowers/vegetation
- Replace block flower style with instanced crossed small petal planes and thin stems.
- Add multiple flower fields in JSON, visual-only.

## Verification
1. Syntax check changed files.
2. Static checks:
   - terrain octree insertion code still present.
   - no AlphaFormat in sky/tree/flower code.
   - tree uses `TreeGenerator` and `InstancedMesh`.
   - flowers use instanced planes/stems, no colliders.
   - roofs have fewer non-overlapping rows.
3. Localhost checks:
   - start npm background server.
   - curl changed modules with HTTP 200 and nonzero JS bytes.
4. Browser/manual checks:
   - phone localhost loads.
   - console has no GL_ALPHA errors.
   - player stands on terrain.
   - leaves render.
   - flowers visible and non-blocky.

## Rule reminders
Never add complex house/tree/flower/rock visual meshes to octree. Terrain may be added because it is world ground, but if it becomes complex or unreliable, add a dedicated simple terrain collider. All file modifications must be complete rewrites only.
