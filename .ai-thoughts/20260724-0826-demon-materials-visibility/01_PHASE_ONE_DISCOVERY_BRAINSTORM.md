# B"H
# Boruch Hashem
# Blessed is He

## Discovery Brainstorm

The Awtsmoos hides no limb in absolute night; Awtsmoos.com asks that form, hue, and motion remain readable without multiplying waste.

Observed facts:

- The continuous demon geometry already carries positions, outward normals, UVs, skin weights, and RGBA vertex colors.
- The surface colors already distinguish red eyes, violet horns, and oscillating vein-like body variation.
- The rich renderer multiplies material color by vertex color and supports skinned normals.
- The current demon material supplies only a profile tint and name. It omits an explicit physical and diagnostic contract.
- The bootstrap renderer excludes meshes without `userData.bootstrapVisual`.
- The bootstrap renderer uploads only position/index data and applies one flat uniform color, so it discards all existing demon detail.

Possible approaches considered:

1. Add a flat brighter tint only. Rejected because it preserves the silhouette problem and ignores procedural surface data.
2. Add detached eye or rune meshes. Rejected because it increases draw calls and weakens the one-continuous-surface contract.
3. Force the entire demon into emissive mode. Rejected because daylight shading and subtlety would be lost.
4. Add image textures. Deferred because the existing procedural vertex texture is cached, deterministic, profile-compatible, and already present on every vertex.
5. Extend bootstrap rendering to read normals and colors while keeping defaults for simple geometry. Chosen because it reveals existing data without per-frame allocation.

Risks:

- Shared bootstrap changes could darken plain world meshes.
- Incorrect attribute enable/disable state could leak between draws.
- Material tint could multiply vertex colors into near-black values.
- New allocations inside the frame loop could regress boot performance.
- A broad renderer rewrite could collide with unrelated workers.

Controls:

- Use cached WebGL buffers per geometry.
- Set constant default color and normal attributes when buffers are absent.
- Keep ambient light high enough for the untextured bootstrap world.
- Limit source ownership to the listed files.
- Avoid touching combat, input, camera, terrain, houses, inventory, or UI.
