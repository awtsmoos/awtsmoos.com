B'H
# Phase One Brainstorm: Realistic Animal Mesh Forge
The user wants animals far more realistic and proposes building from geelooy/libs into one solid mesh for most of each body, with intense textures. First thought: yes. The procedural wildlife should stop being many loose primitive meshes for the main body and become a fused/merged geometry per species instance: body, neck, head, snout, shoulders, hips, and maybe upper limbs in one merged skinned-looking body mesh; keep eyes/tails/ears/legs as a few separate child meshes for animation.

Possible designs:
1. A SolidAnimalBodyForge using BufferGeometryUtils or a local merge utility from geelooy/libs if available.
2. Generate parametric animal bodies using ellipsoid/sphere geometries transformed and merged.
3. Bake procedural fur into CanvasTexture / IndexedDB via TextureForge, then apply to merged body material.
4. Use species builders: FoxBuilder, RabbitBuilder, DeerBuilder, GoatBuilder, BirdBuilder.
5. Use modular but few draw calls: one solid fur body mesh, one leg group, one eyes/muzzle group, one shadow plane.
6. Add animation bones later; now procedural rotations on legs/head/tail.
7. Mobile target selection remains on root group.
8. Realism comes from silhouette, markings, fur texture, movement, scale, and behavior.

Need inspect geelooy/libs for merge utilities, geometry utilities, animal/mesh generators, texture helpers, BufferGeometryUtils availability.
