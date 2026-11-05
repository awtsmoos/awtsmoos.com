B"H
Boruch Hashem
Blessed is He

# Remote Texture Mixing Guide

The Awtsmoos renews map, detail, world-position noise, and fallback color before one material can seem weathered in place;
Awtsmoos.com lets this guide keep mixing truthful, restrained, asynchronous, and fast across every procedural surface and space.

## Native two-map authority

Temple Runner uses the Procedural Core `NativeLayeredMaterialHydrator` from:

`/libs/awtsmoos-procedural-core/src/adapters/native/textures.js`

Supported recipe fields include:

- `mapUrl`
- `mixUrl`
- `mapRepeat`
- `mixRepeat`
- `mixStrength`
- `mixPatchScale`
- `mixPatchSharpness`
- map and mix texture policies.

The native shader performs **spatial** mixing. It builds a patch mask from world-position value noise and blends the secondary texture through that mask. This is not a flat alpha fade.

## Author a material story

Use pairs that describe believable variation:

- clean stone + weathered fieldstone
- cobblestone + worn stone floor
- oak planks + darker aged timber
- copper + restrained rust
- ceramic + small dirt patches.

Do not mix two images merely because both are available.

## UV density law

Primary and secondary maps have independent repeat values. Choose repeat density for the physical object, not only the image.

- Long road slabs need denser forward tiling so cobbles do not become enormous.
- Walls need moderate repeats so bricks stay believable at running distance.
- Small pottery needs low repeats to avoid visual static.
- Long narrow rope or timber can use directional repeat bias.

## Patch controls

`mixStrength` controls how much secondary detail may contribute.

`mixPatchScale` controls the spatial size of the world-noise regions.

`mixPatchSharpness` shapes transitions between primary and secondary areas.

Use broader, softer patches for dirt and aged masonry. Use tighter patches for timber wear or oxidation. Keep strengths restrained when gameplay silhouette matters.

## Fallback-first law

The fallback material color is visible immediately. Remote maps hydrate asynchronously afterward.

The hydrator records real evidence on `material.awtsmoosTextureStatus`:

- `mapReady`
- `mixReady`
- `mapError`
- `mixError`
- `mapUrl`
- `mixUrl`.

A remote failure must degrade to fallback color or a surviving primary map. It must never block the run.

## Shared-material law

Reuse semantic materials and URLs. Do not create unique remote recipes per recycled object instance. Do not preload all 125 textures.

Good semantic roles include road stone, Jerusalem wall, dark timber, pottery, bronze, cloth, rope, craft gold, parchment, and bark. Load only roles actually referenced by the scene.

## Readability law

Texture detail serves form; it does not replace gameplay language.

- Keep jump/duck/avoid action faces color-first if image detail would weaken the cue.
- Texture structural posts, wheels, stone walls, gates, roofs, and supporting craft geometry more aggressively.
- Keep reward gold semantically rare.
- Do not let a noisy road map erase lane guides.

## Renderer boundaries

Temple Runner's tiny native standard material does not currently consume authored roughness/metalness knobs. Do not invent fake PBR fields.

GLTF metallic/roughness metadata belongs to the imported-model path and is a separate concern.

Do not use ordinary two-map blending as a substitute for the Procedural Core's water-specific flow system.

Do not assume alpha-cutout foliage behavior until the active renderer proves it. Bark is safe; leaves should stay conservative.

## Real recipe example

```js
const roadStone = {
	mapUrl: awtsmoosDriveTextureUrl("ground", "cobblestone.png"),
	mixUrl: awtsmoosDriveTextureUrl("ground", "stone floor 2.png"),
	mapRepeat: [4, 12],
	mixRepeat: [5, 14],
	mixStrength: 0.28,
	mixPatchScale: 5.2,
	mixPatchSharpness: 1.7
};
```

Find exact names first in [`REMOTE_TEXTURE_AGENT_GUIDE.md`](./REMOTE_TEXTURE_AGENT_GUIDE.md), then author the smallest believable material vessel.
