B"H

# Phase Three: Final Implementation Plan

## Production files

1. `MinimalMeadowTerrainSources.js`
	- Load each source once.
	- Expose stable role groups for base grass, lush grass, dry grass, soil, moss/marsh, road center, and shoulder.
	- Preserve original decoded images and URLs.

2. `MinimalMeadowTerrainComposites.js`
	- Keep the existing exported builder name for compatibility.
	- Return independent source selections instead of canvases.
	- Attach evidence that no resampling or mosaic assembly occurred.

3. `MinimalMeadowTerrainMaterialDensity.js`
	- Build desktop/mobile density profiles with larger world tiles.
	- Configure one base source, one road-center mix source, and six independent layers.
	- Put shoulder at renderer slot 3.
	- Add deterministic angles and supported slope/height/wetness/zone controls.
	- Report world units per source texture.

4. `MinimalMeadowWorldUvDensity.js`
	- Generate finite continuous world UVs.
	- Export ping-pong and derivative helpers for acceptance tests.
	- Report exact reversal and repeat evidence.

5. `MinimalMeadowRoadRibbon.js`
	- Rewrite as a continuous multi-band geometry generator aligned to Bézier samples and terrain height.
	- Export geometry data and diagnostics.
	- Do not render it above the terrain in the package.

6. `MinimalMeadowTerrainPackage.js`
	- Build only the collision-aligned terrain mesh as rendered road/meadow authority.
	- Remove the duplicate rendered ribbon.
	- Preserve public package shape and enrich diagnostics.

7. `TerrainMaterialStackPreset.js`
	- Lower repeats and define explicit grass, dry, soil, shoulder, wet/moss, and rock layers.

8. `RoadMaterialStackPreset.js`
	- Lower repeats and define center/soil/grass transition roles without checkerboard assumptions.

9. New pure modules
	- `MinimalMeadowTerrainNoise.js`: deterministic smooth macro noise.
	- `MinimalMeadowTerrainBlendModel.js`: normalized analytical meadow/road/material weights and grid sampling.
	- `MinimalMeadowTerrainContinuity.js`: boundary and UV continuity metrics.

## Tests after production

- `minimalMeadowTerrainBlendModel.test.mjs`
- `minimalMeadowTerrainUvContinuity.test.mjs`
- `minimalMeadowRoadSurface.test.mjs`
- `minimalMeadowTerrainMaterialProfiles.test.mjs`

## Verification commands

- `node --check` for every touched production module.
- `node --test` for the four focused tests.
- Existing related mobile and terrain tests where imports permit.
- Readback, line-count audit, scope audit, and `git diff --check`.
- No commit.

## Completion evidence

- Maximum former-boundary discontinuity below the declared test threshold.
- Macro samples vary continuously within and across cells.
- Ping-pong coordinates are finite, continuous, and reverse derivative sign.
- Road center + shoulder + meadow equals one within floating-point tolerance.
- Road vertices and UVs are finite and continuous.
- Desktop/mobile source world-unit reports are present and grass density is materially lower than the old 64-72 texels/world target.
- Rendered package contains no elevated duplicate road mesh.

The Awtsmoos curves the road without severing the field, and every measured test becomes a lamp; Awtsmoos.com carries the traveler through stone, shoulder, and grass as one continuous song.
