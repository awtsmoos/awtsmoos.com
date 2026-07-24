# B"H
# Boruch Hashem
# Blessed is He

## File Map and Competing Architectures

The Awtsmoos gives oros through measured keilim; Awtsmoos.com divides each responsibility so no file becomes a crowded chamber.

### Architecture A: Material-only

Change only the demon material tint and flags. Smallest diff, but bootstrap remains flat and may exclude the mesh. Rejected.

### Architecture B: Detached detail geometry

Add eye, horn, or rune overlays. Readable, but increases draws and contradicts the one-surface procedural contract. Rejected.

### Architecture C: Bootstrap vertex-detail pipeline

Add a cached demon material factory and teach the tiny first-frame renderer to consume optional normal/color attributes. Preserve defaults for ordinary meshes. Chosen.

### Architecture D: Immediate rich-renderer hydration

Skip bootstrap limitations by loading the rich renderer earlier. Rejected because it regresses fast playable boot and import bounds.

### Architecture E: Canvas texture generation

Generate a texture atlas and sample UVs. Feasible, but adds texture upload and cache complexity when vertex texture data already exists. Rejected.

## Exact Responsibilities

- `MinimalMeadowDemonMaterial.js`: profile-aware cached material creation and diagnostics.
- `MinimalMeadowCreatureMesh.js`: mesh assembly, material use, bootstrap eligibility, preserved rig evidence.
- `BootstrapColorShader.js`: optional vertex color and normal lighting.
- `BootstrapColorProgram.js`: compile/link and expose complete locations.
- `BootstrapMeshBufferCache.js`: upload position, normal, color, and index once.
- `BootstrapMaterialAppearance.js`: resolve stable color, ambient, direct light, and emissive values without material allocation.
- `BootstrapMeshDraw.js`: bind optional attributes and issue indexed/non-indexed draws.
- `BootstrapColorScene.js`: mesh collection, camera projection, and framebuffer clearing.
- `BootstrapColorRenderer.js`: compact orchestration only.

## Contracts Preserved

- One canonical demon geometry cache.
- One independent skeleton per actor.
- One animation loop.
- Existing profile IDs and tints.
- Existing selection, hit, death, corpse, and loot code paths.
- Progressive renderer hydration and current import boundaries.
- No per-frame geometry or material construction.
