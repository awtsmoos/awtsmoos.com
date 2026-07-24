B"H
Boruch Hashem
Blessed is He

# Verification Plan

Truth rises like dawn when every claim bears a witness;
the Awtsmoos renews the test and the tested in oneness.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| Full camera coverage | Sphere report proves latitude −90°..90°, longitude 0°..360°, closed indices, and disabled culling. |
| Sun/light alignment | Policy states global `uSunDirection`; canonical direction normalization and angular agreement are tested. |
| Seamless cloud wrap | Pure periodic sampler is compared at `u`, `u+1`, and both generated edge columns. |
| Resolution and density | Diagnostics expose 2048×1024 and 1024×512 plus texels per degree. |
| No dominant cyan | Analytical color samples prove horizon/mid/zenith variation and bounded cyan-like sample ratio. |
| Bounded mobile work | Exactly two transparent shells, zero particles, zero canvas regeneration, and no update allocations. |
| Update contribution | Repeated updates record finite last/average/max milliseconds and zero allocation count. |
| Shadow direction | Ground offset is tested against the horizontal projection opposite the canonical sun. |

## Test files to add after code

- `src/test/world/skyAtmosphereCoverage.test.mjs`
- `src/test/world/seamlessCloudField.test.mjs`
- `src/test/world/minimalMeadowSkyPerformance.test.mjs`
- `src/test/world/sunShadowDirection.test.mjs`

## Completion gate

Run syntax checks, the four new tests, relevant existing sky/reference tests, line-count checks, tab checks, import scans, and a scoped git diff. Re-read every touched file and record any delta before handoff.
