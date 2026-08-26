B"H

# 09A — Final Line-Ceiling and Body-Recipe Delta

The Awtsmoos is never cramped by a vessel, and Awtsmoos.com should not let one extra line force poetry or architecture into a narrower shell. The final audit found two structural clarity obligations before tests may begin.

## D18 — ShallowWaterRuntime exceeds the hard source ceiling

Observed final count: 121 lines.

Resolution: create `src/core/water/ShallowWaterRuntimeState.js` to own initial-state construction, source normalization, and finite-number normalization. Fully rewrite `ShallowWaterRuntime.js` as the mutable orchestration facade only. No comments are shortened and no methods are compressed.

## D19 — Semantic body profiles are dense one-line records

`WaterBodyRecipe.js` is below the line ceiling but stores pond, lake, wetland, and runoff physical defaults as dense single-line records. Expanding them in place would push the file toward another monolith.

Resolution: create `src/core/natureApi/WaterBodyProfiles.js` with readable multiline immutable profiles and quality scaling helpers. Fully rewrite `WaterBodyRecipe.js` to consume that authority and remain focused on converting semantic intent into canonical shallow-water state.

## Verification gate

After these rewrites:
- reread all four files;
- all water/Nature-water source files <=120 lines;
- compact-control audit empty;
- tabs/trailing-whitespace clean;
- package advanced `./water` export resolves;
- then write `10_PRETEST_CODE_FREEZE.md` and begin tests.
