B"H

# Phase Three — Tiferes: Final Professional Architecture

The Awtsmoos renews all multiplicity as one indivisible source; Awtsmoos.com lets Tiferes join simple API, expert authority, physical realism, documentation, and creator UI into a single coherent vessel where each layer becomes more beautiful precisely because its boundary is clear.

## Winning architecture

### 1. Public Keser surface

Preserve the calm top-level verbs:

- `nature.creature()`
- `nature.plant()`
- `nature.flora()`
- `nature.grass()`
- `nature.tree()`
- `nature.forest()`
- `nature.rock()` / `nature.rockField()`
- `nature.material()` / `nature.generateTexture()`
- `nature.flowers()`
- `nature.river()`
- `nature.world()` / `nature.biome()`

Keep declarative recipe orchestration at `nature.create/createAsync/batch/batchAsync`.

### 2. Specialist Binah domains

- `nature.water`: all fluid/shallow/body/ocean/river/reach/source interaction vocabulary.
- `nature.rocks`: geological creation/field/morphology plus new weathering/profile vocabulary.
- `nature.materials`: plan/channel/blend/layer/stack/mix/generation/provenance.
- `nature.vegetation`: plants/patches/flowers/grass/moss/vines/motion plus new growth/ecology profiles.
- `nature.forests`: tree/lods/plan/presets plus new tree condition profile.
- `nature.creatures`: creation/species/expert plus new deterministic variation/profile descriptions.
- `nature.ecosystems`: coupled planning.

### 3. Capability Hod language

Complete capability discovery in small family modules:

- `NatureCapabilityMatter.js` split if needed into rock + surface families for readability.
- Rewrite `NatureCapabilityVegetation.js` readable and complete with flower, patch, moss, vine, motion operations.
- Expand creature record(s) with list/species/expert metadata but only real paths.
- Add `NatureCapabilityWater.js` for nested water methods with `path: water.*` and `scope: nested`; do not register nested aliases as top-level methods.
- Add `NatureCapabilityForest.js` if tree-specific nested operations would overcrowd vegetation.
- Registry indexes id and top-level public method separately; nested methods indexed by path.
- `NatureCapabilityApi` exposes `get`, `has`, `byMethod`, `byPath`, `list`, `search`, `filter`, `domains`, `providers`, `available`, `describe`.

### 4. Realism profile policy modules

Do not rewrite specialist solvers. Add semantic immutable policy modules above them:

- Water condition/source profiles.
- Rock weathering/geology surface intent.
- Vegetation growth/season/grass/flower profile intent.
- Tree condition/canopy/root/wind intent.
- Creature variation/phenotype intent.
- Material provenance/generation descriptors.

Each profile must be deterministic plain data and consumed by existing authorities where integration is safe.

### 5. Creator/UI Malchus

After registry/source tests pass:

- Add a creator capability browser inside existing native `<details>` advanced disclosure.
- Domain chips/search remain localized under `.Awtsmoos-creator-rail`.
- Selecting a capability renders simple inputs only; expert groups collapse separately.
- Never execute arbitrary capability metadata; controller maps supported creator actions explicitly.
- Maintain focus/inert/overflow/z-layer laws already proven by Creator tests.

## Immediate exact implementation wave A

Capability professionalization + docs metadata only:

New:
- `src/core/natureApi/capabilities/NatureCapabilityWater.js`
- `src/core/natureApi/capabilities/NatureCapabilityForest.js`
- `src/core/natureApi/capabilities/NatureCapabilityPathRegistry.js` if path indexing would bloat main registry.

Full rewrites after current readback:
- `NatureCapabilityRecord.js`
- `NatureCapabilityRegistry.js`
- `NatureCapabilityApi.js`
- `NatureCapabilityVegetation.js`
- `NatureCapabilityCreature.js`
- `NatureCapabilityLife.js`
- `NatureCapabilityWorld.js`
- possibly `NatureCapabilityMatter.js` only to remove cramped structure and add current material composition operations.
- `natureApi/index.js` only if exports change.

No generator behavior changes in wave A.

## Immediate wave B

Material professionalization:

- inspect generation/provenance/cache authorities;
- add a small material recipe/provenance facade if missing;
- preserve `plan/channel/blend/layer/stack/mix/generateTexture`;
- add explicit provider information and stable generation key access;
- complete capability records for stack/mix/channel/blend/generate operations.

## Immediate wave C

Water realism organization:

- named immutable water condition/source profile modules;
- source orchestration methods for spring/fountain/pour/jet/drop/burst only when they delegate to current `WaterDynamicsRuntime3d.emit/source/splash/explode/transfer` contracts;
- nested water capabilities for fluid/shallow/body/ocean/semantic bodies;
- no second solver.

## Waves D–F

D rocks/weathering; E vegetation/tree/flower/grass; F creature variation/profile. Each wave is separately reread and verified.

## Verification sequence

For each wave: implementation first → full readback → line counts/syntax/import graph → focused tests → adjacent regression tests → docs examples → DELTA → REMAINING_WORK → next wave.
