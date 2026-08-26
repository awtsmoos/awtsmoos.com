B"H

# 12 — Focused Verification Green

The Awtsmoos renews every proof together with the water it measures; Awtsmoos.com records that the first complete unified-water witness now stands green after one evidence-derived semantic API repair.

## Focused suite

Command:
`node --test test/unifiedWaterConservation.test.mjs test/unifiedWaterSources.test.mjs test/unifiedWaterOceanShallowApi.test.mjs`

Final result:
- 18 tests
- 18 passed
- 0 failed

## Proven behaviors

- primary particle mass equals reconciled PIC/FLIP grid mass after emission;
- splash and impulse-only explosion preserve mass;
- explicit explosion spawn mass is reported and conserved;
- drain removes exactly the returned parcel mass;
- transfer preserves combined mass across source/target runtimes;
- capacity-limited transfer leaves unaccepted water in the source;
- continuous source mass follows `massRate * dt`;
- zero delta emits nothing and does not advance source sequence;
- nested source options are cloned/frozen;
- equal seeds and event order produce equal primary particles;
- semantic default placement keeps rain high and springs low inside the vessel;
- wellspring/fountain/waterfall/hose use the shared source authority;
- ocean field is deterministic, finite, time-varying, and returns normalized normals;
- authored 2D ocean directions remain horizontal;
- shallow rain/source evolution stays finite and increases water depth;
- Nature water exposes fluid, shallow, ocean, pond/lake/wetland/runoff;
- semantic body profiles remain distinct;
- advanced package water export resolves.

## Test-derived production repair

The first run passed 16/18. Both failures exposed one friendly-API discoverability gap: semantic body runtimes carried canonical kind at `recipe.kind` but not directly at `runtime.kind`. `WaterBodyRuntime.js` was fully rewritten with a documented read-only getter only. The unchanged suite then passed 18/18.

## Remaining work

- neighboring legacy water/river/liquid regression universe;
- hidden water test/docs/export discovery;
- realism capability review after regression safety is established;
- final source/test readback and completion delta.
