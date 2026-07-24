B"H

# Shadow Demon Material and Readability Handoff

## Completion evidence

- Focused tests: 11 passed, 0 failed.
- Syntax: every touched executable module passed `node --check`.
- File size: largest touched executable module is 107 lines.
- Six live demons resolve to six unique families, six unique normalized colors, and six unique cached maps.
- Texture allocation: 6 canvases total, 256×256 each, family limit 7 including legacy compatibility, 0 per-frame allocations.
- UV range: 0.0003818253 to 0.9996794571; map coordinates are bound.
- Vertex luminance: minimum 0.330281, average 0.656049, maximum 0.925592.
- Anatomical vertex contrast range: 0.595311.
- Live-light aggregate average visible luminance: 0.0767528763.
- Live-light minimum visible luminance across all profiles: 0.0091724586.
- Per-profile average visible luminance range: 0.0504648313 to 0.0985617446.
- Bootstrap minimum luminance range: 0.1069350475 to 0.1604370798.
- Base-color luminance range: 0.28 to 0.42.
- Texture minimum luminance range: 0.2115662745 to 0.2570705882.
- Texture average luminance range: 0.3615424 to 0.4517241725.
- Texture maximum luminance range: 0.7043168627 to 0.7902650980.

## Renderer records

Bootstrap record:
- formula `uColor * vColor`
- vertex colors enabled for demons
- ordinary materials unchanged
- global brightening false

Rich record:
- formula `uColor * vColor * texel`
- consumed property `mapImage`
- actual map data and procedural pattern present
- roughness 0.78 recorded, with current shader non-consumption documented
- metallic factor 0.035
- albedo-gated emissive strength 0.06, not a full-body glow

## Profile evidence

- tzel-chai: violet-ash / ash-runes / average visible 0.0775439428
- esh-katan: scorched-ember / ember-scars / average visible 0.0741620939
- ruach-afelah: storm-blue / storm-veins / average visible 0.0985617446
- shomer-hoshech: midnight-indigo / armor-ridges / average visible 0.0504648313
- ketem-layla: dusk-magenta / dusk-glyphs / average visible 0.0714124961
- ayin-raash: weathered-ochre / stone-runes / average visible 0.0883721490

Full per-profile anatomy, texture, and material records are in `05_FINAL_MEASUREMENTS.json`.

## Test command

```sh
node --test --test-concurrency=1 \
 experiments/Awtsmoos/src/test/geometry/minimalMeadowDemonMaterialContract.test.mjs \
 experiments/Awtsmoos/src/test/world/minimalMeadowDemonMaterial.test.mjs \
 experiments/Awtsmoos/src/test/app/minimalMeadowDemonReadabilityRenderer.test.mjs \
 experiments/Awtsmoos/src/test/world/minimalMeadowDemonReadabilityProfiles.test.mjs
```

Result: 11 tests, 11 pass, 0 fail. No commit was created.
