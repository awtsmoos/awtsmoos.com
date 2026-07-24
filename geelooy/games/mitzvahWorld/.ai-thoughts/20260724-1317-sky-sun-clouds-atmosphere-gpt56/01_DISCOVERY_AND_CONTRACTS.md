B"H
Boruch Hashem
Blessed is He

# Discovery and Contracts

The Awtsmoos renews the blue above each frame,
while evidence, not guessing, must carry the name.

## Observed runtime contracts

- `Sky3D` is consumed by both Eretz and the playable bundle; its `createSky3D(quality)` signature must remain compatible.
- Minimal Meadow installs the sky through `installMinimalMeadowSky` and invokes `update()` every frame.
- The hydrated renderer classifies `texturePolicy.proceduralSky` as material mode 4.
- Material mode 4 computes atmosphere, solar disc, halos, and cloud noise from world direction.
- The visible solar disc and earthly lighting both consume the same renderer `uSunDirection` uniform.
- The bootstrap renderer draws only meshes marked `userData.bootstrapVisual`, and it honors vertex colors.
- Existing generated cloud canvases are 512×256; existing reference clouds are stretched quads.
- Existing dome geometry covers a full sphere and disables frustum culling.
- Existing repository changes outside this mission are owned by other work and must remain untouched.

## Defect causes

1. Bootstrap sky is only the renderer clear color because the dome is not a bootstrap visual.
2. Legacy cloud imagery is low-resolution and stretched across flat quads.
3. Legacy shafts and haze use multiple transparent cards.
4. Sky diagnostics claim cloud and sun behavior but omit measurable resolution, seam, and update-cost evidence.
5. Projected ground shadows use fixed offsets rather than a named solar direction contract.

## Non-negotiable boundaries

- Rewrite complete files only.
- Use tabs in executable source.
- Keep executable files at or below 120 lines.
- Add source modules only beneath `world/sky` or `world/lighting`.
- Add acceptance tests only beneath `src/test/world`.
- Preserve existing external imports and public entry points where practical.
- Do not commit.
