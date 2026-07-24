B"H
Boruch Hashem
Blessed is He

# Architecture Plan

The Awtsmoos makes one heaven from many measured vessels;
Awtsmoos.com keeps each vessel small, testable, and bounded.

## Selected architecture

1. Keep one opaque, camera-centered procedural atmosphere dome so scattering and the sun remain tied to the renderer's primary light direction.
2. Mark the dome as a bootstrap visual and give its vertices an analytical horizon-to-zenith gradient, eliminating the flat cyan first frame.
3. Replace cloud cards with two spherical cloud shells using one-time generated periodic fields at 2048×1024 and 1024×512.
4. Generate each field once, cache it, duplicate its first/last columns exactly, and expose a pure periodic sampler for seam tests.
5. Move cloud shells by tiny quaternion rotations; never repaint canvases per frame and never allocate in the update loop.
6. Replace reference haze, cloud, and shaft mesh factories with bounded descriptors consumed by the sky system and diagnostics.
7. Derive projected shadow offsets from the canonical golden-hour direction rather than unexplained constants.

## Files to rewrite

- `app/MinimalMeadowSky.js`: camera centering, cloud motion, allocation-free timing diagnostics.
- `world/Sky3D.js`: atmosphere plus two bounded shells and diagnostic assembly.
- `world/SunShadowMeshes.js`: direction-derived projection helpers.
- `world/SunShadowProjector.js`: canonical direction use and measured update diagnostics.
- `world/sky/ProceduralAtmosphereTexture.js`: high-resolution periodic generation and metadata.
- `world/sky/SkyDome.js`: full sphere plus bootstrap analytical vertex colors.
- `world/sky/SkyMeshFactory.js`: focused mesh/material construction under the line limit.
- `world/lighting/ReferenceGoldenHourPreset.js`: canonical normalized direction and atmosphere profile.
- `world/lighting/ReferenceSkyCloudSystem.js`: two cloud-layer descriptors and haze contract.
- `world/lighting/VolumetricSunShaftSystem.js`: analytical shaft descriptors without card overdraw.

## New focused modules

- `world/sky/SkySphereGeometry.js`: sphere topology and coverage report.
- `world/sky/SkyAtmosphereColor.js`: analytical bootstrap gradient and variation report.
- `world/sky/SeamlessCloudField.js`: periodic multi-scale scalar field and seam evidence.
- `world/sky/SkyCloudShell.js`: cloud-shell mesh construction.
- `world/lighting/SunDirectionContract.js`: normalization, angular agreement, and projected offsets.
