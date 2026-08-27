# B"H

Boruch Hashem
Blessed is He

# Mitzvah World System Overlap Map

Snapshot: **2026-07-23T23:32:30.660Z**. This file combines the best available structural information about systems that are similar, adjacent, duplicated, experimental, or disconnected. It does **not** merge runtime code.

The Awtsmoos is beyond every division, while finite architecture still needs clear vessels. This map lets agents compare related directories before creating a third implementation or deleting a path that may still be imported.

## How to use this map

1. Start from the live root entry and trace imports.
2. Compare the related directories listed in the relevant cluster.
3. Check tests, diagnostics, and Git history before choosing a canonical owner.
4. Consolidate documentation first; consolidate code only in a separately verified task.

<a id="meadow-runtimes"></a>

## Meadow and fallback runtimes

The former basic and emergency meadow systems were consolidated into the live app stack. The app runtime and launcher now form the single meadow ownership path.

**Related directories:**
- [`experiments/Awtsmoos/src/app`](experiments/Awtsmoos/src/app/DIRECTORY_GUIDE.md) — Application assembly, boot phases, meadow runtime, render fallbacks, player hydration, and high-level runtime coordination.
- [`experiments/Awtsmoos/src/launcher`](experiments/Awtsmoos/src/launcher/DIRECTORY_GUIDE.md) — Page boot, route selection, menu loading, mode dispatch, and the direct shared-meadow entry.

**Recommended first inspection order:**
1. `experiments/Awtsmoos/src/app`
2. `experiments/Awtsmoos/src/launcher`

**Consolidation caution:** Treat names and conceptual similarity as evidence of overlap, not proof that implementations are interchangeable.

<a id="rendering-stacks"></a>

## Rendering stacks

The project contains a lightweight scene/GLTF library, the canonical app-level progressive renderer, and focused render helpers. Emergency fallback visuals were absorbed into the app renderer.

**Related directories:**
- [`experiments/light-three-gltf`](experiments/light-three-gltf/DIRECTORY_GUIDE.md) — Custom lightweight Three-like scene graph, math, WebGL helpers, and GLTF loading stack.
- [`experiments/Awtsmoos/src/app`](experiments/Awtsmoos/src/app/DIRECTORY_GUIDE.md) — Application assembly, boot phases, meadow runtime, render fallbacks, player hydration, and high-level runtime coordination.
- [`experiments/Awtsmoos/src/render`](experiments/Awtsmoos/src/render/DIRECTORY_GUIDE.md) — Focused rendering helpers outside the larger app renderer stack.

**Recommended first inspection order:**
1. `experiments/light-three-gltf`
2. `experiments/Awtsmoos/src/app`
3. `experiments/Awtsmoos/src/render`

**Consolidation caution:** Treat names and conceptual similarity as evidence of overlap, not proof that implementations are interchangeable.

<a id="terrain-materials"></a>

## Terrain, materials, and asset preparation

Terrain geometry, runtime material policy, loaders, source textures, processed materials, and catalogs are split across runtime and asset trees.

**Related directories:**
- [`assets/materials`](assets/materials/DIRECTORY_GUIDE.md) — Material and surface-asset collections used to dress terrain, vegetation, and world geometry.
- [`experiments/Awtsmoos/src/assets`](experiments/Awtsmoos/src/assets/DIRECTORY_GUIDE.md) — Asset loading, catalogs, caches, material resolution, GLTF handling, and progressive fetch behavior.
- [`experiments/Awtsmoos/src/world/materials`](experiments/Awtsmoos/src/world/materials/DIRECTORY_GUIDE.md) — World material definitions and material assignment policy.
- [`experiments/Awtsmoos/src/world/terrain`](experiments/Awtsmoos/src/world/terrain/DIRECTORY_GUIDE.md) — Terrain data, geometry, collision, and terrain runtime helpers.
- [`experiments/Awtsmoos/tools/materials`](experiments/Awtsmoos/tools/materials/DIRECTORY_GUIDE.md) — Structural area named `materials`. Its immediate files and children below are the evidence for its current responsibilities.

**Recommended first inspection order:**
1. `assets/materials`
2. `experiments/Awtsmoos/src/assets`
3. `experiments/Awtsmoos/src/world/materials`
4. `experiments/Awtsmoos/src/world/terrain`
5. `experiments/Awtsmoos/tools/materials`

**Consolidation caution:** Treat names and conceptual similarity as evidence of overlap, not proof that implementations are interchangeable.

<a id="procedural-world"></a>

## Procedural world and village generation

Village, road, house, primitive, text-driven, and public API systems collaborate but are maintained in separate directories.

**Related directories:**
- [`experiments/Awtsmoos/src/world/village`](experiments/Awtsmoos/src/world/village/DIRECTORY_GUIDE.md) — Large procedural-village system: layout, buildings, roads, populations, materials, districts, and runtime composition.
- [`experiments/Awtsmoos/src/world/road`](experiments/Awtsmoos/src/world/road/DIRECTORY_GUIDE.md) — Road layout, splines, meshes, intersections, and roadside composition.
- [`experiments/Awtsmoos/src/world/house`](experiments/Awtsmoos/src/world/house/DIRECTORY_GUIDE.md) — House generation, geometry, interiors, and structure assembly.
- [`experiments/Awtsmoos/src/world/primitives`](experiments/Awtsmoos/src/world/primitives/DIRECTORY_GUIDE.md) — Reusable procedural geometry primitives for world construction.
- [`experiments/Awtsmoos/src/world/proceduralApi`](experiments/Awtsmoos/src/world/proceduralApi/DIRECTORY_GUIDE.md) — Public procedural-world API and request/response adapters.
- [`experiments/Awtsmoos/src/world/proceduralText`](experiments/Awtsmoos/src/world/proceduralText/DIRECTORY_GUIDE.md) — Text-driven procedural-world interpretation and generation.
- [`references/canonical-procedural-village`](references/canonical-procedural-village/DIRECTORY_GUIDE.md) — Canonical procedural-village reference files and manifest evidence.

**Recommended first inspection order:**
1. `experiments/Awtsmoos/src/world/village`
2. `experiments/Awtsmoos/src/world/road`
3. `experiments/Awtsmoos/src/world/house`
4. `experiments/Awtsmoos/src/world/primitives`
5. `experiments/Awtsmoos/src/world/proceduralApi`
6. `experiments/Awtsmoos/src/world/proceduralText`
7. `references/canonical-procedural-village`

**Consolidation caution:** Treat names and conceptual similarity as evidence of overlap, not proof that implementations are interchangeable.

<a id="vegetation"></a>

## Vegetation, trees, and forest systems

Botany rules, tree generation, forest composition, grass, and source texture libraries overlap semantically but own different layers.

**Related directories:**
- [`assets/materials/local/world/awtsmoos-nature`](assets/materials/local/world/awtsmoos-nature/DIRECTORY_GUIDE.md) — Nature-oriented source assets, especially forest vegetation and tree libraries.
- [`experiments/Awtsmoos/src/world/botany`](experiments/Awtsmoos/src/world/botany/DIRECTORY_GUIDE.md) — Botanical generation, flower or plant geometry, and botany-specific world rules.
- [`experiments/Awtsmoos/src/world/forest`](experiments/Awtsmoos/src/world/forest/DIRECTORY_GUIDE.md) — Forest-level composition and coordination.
- [`experiments/Awtsmoos/src/world/grass`](experiments/Awtsmoos/src/world/grass/DIRECTORY_GUIDE.md) — Grass generation or rendering.
- [`experiments/Awtsmoos/src/world/trees`](experiments/Awtsmoos/src/world/trees/DIRECTORY_GUIDE.md) — Tree generation, placement, geometry, and world integration.

**Recommended first inspection order:**
1. `assets/materials/local/world/awtsmoos-nature`
2. `experiments/Awtsmoos/src/world/botany`
3. `experiments/Awtsmoos/src/world/forest`
4. `experiments/Awtsmoos/src/world/grass`
5. `experiments/Awtsmoos/src/world/trees`

**Consolidation caution:** Treat names and conceptual similarity as evidence of overlap, not proof that implementations are interchangeable.

<a id="combat-ui"></a>

## Combat domain, action bars, targeting, and HUD

Domain rules live under gameplay while browser widgets and target presentation live under UI and styles.

**Related directories:**
- [`experiments/Awtsmoos/src/gameplay/actionbar`](experiments/Awtsmoos/src/gameplay/actionbar/DIRECTORY_GUIDE.md) — Action-bar slot models, commands, activation rules, and presentation-neutral action selection.
- [`experiments/Awtsmoos/src/gameplay/combat`](experiments/Awtsmoos/src/gameplay/combat/DIRECTORY_GUIDE.md) — Combat turns, melee, Torah abilities, cooldowns, targeting gates, progression rewards, and encounter state.
- [`experiments/Awtsmoos/src/ui`](experiments/Awtsmoos/src/ui/DIRECTORY_GUIDE.md) — HUD, menus, targeting presentation, action/combat widgets, dialogue, inventory, and browser DOM coordination.
- [`styles`](styles/DIRECTORY_GUIDE.md) — CSS for loading, meadow HUD, menus, mobile controls, combat, game rails, and shell visibility.

**Recommended first inspection order:**
1. `experiments/Awtsmoos/src/gameplay/actionbar`
2. `experiments/Awtsmoos/src/gameplay/combat`
3. `experiments/Awtsmoos/src/ui`
4. `styles`

**Consolidation caution:** Treat names and conceptual similarity as evidence of overlap, not proof that implementations are interchangeable.

<a id="testing-surfaces"></a>

## Colocated and integration test surfaces

Most subsystem tests live under `src/test`, while a smaller external `tests` tree exercises broader integration contracts.

**Related directories:**
- [`experiments/Awtsmoos/src/test`](experiments/Awtsmoos/src/test/DIRECTORY_GUIDE.md) — Colocated subsystem tests and test harnesses for the source tree.
- [`experiments/Awtsmoos/tests`](experiments/Awtsmoos/tests/DIRECTORY_GUIDE.md) — Higher-level integration tests kept outside the source tree.

**Recommended first inspection order:**
1. `experiments/Awtsmoos/src/test`
2. `experiments/Awtsmoos/tests`

**Consolidation caution:** Treat names and conceptual similarity as evidence of overlap, not proof that implementations are interchangeable.

<a id="movie-pipeline"></a>

## Movie runtime, projects, tools, and evidence

Runtime movie logic is separated from authored projects, exact-generation tools, and captured evidence.

**Related directories:**
- [`experiments/Awtsmoos/src/movie`](experiments/Awtsmoos/src/movie/DIRECTORY_GUIDE.md) — Movie runtime, timeline sampling, actor direction, camera direction, recording, export, and project execution.
- [`movies`](movies/DIRECTORY_GUIDE.md) — Movie projects, generated evidence, manifests, and tool entry points.

**Recommended first inspection order:**
1. `experiments/Awtsmoos/src/movie`
2. `movies`

**Consolidation caution:** Treat names and conceptual similarity as evidence of overlap, not proof that implementations are interchangeable.

<a id="diagnostics"></a>

## Diagnostics, logs, tools, and root audits

Live diagnostics, captured logs, offline tools, and root audit reports describe different stages of observability.

**Related directories:**
- [`experiments/Awtsmoos/src/diagnostics`](experiments/Awtsmoos/src/diagnostics/DIRECTORY_GUIDE.md) — Runtime observability, boot evidence, health receipts, and diagnostics serialization.
- [`experiments/Awtsmoos/tools/diagnostics`](experiments/Awtsmoos/tools/diagnostics/DIRECTORY_GUIDE.md) — Structural area named `diagnostics`. Its immediate files and children below are the evidence for its current responsibilities.
- [`.`](DIRECTORY_GUIDE.md) — Project entry, top-level audits, handoff notes, and navigation for the Mitzvah World game.

**Recommended first inspection order:**
1. `experiments/Awtsmoos/src/diagnostics`
2. `experiments/Awtsmoos/tools/diagnostics`
3. `.`

**Consolidation caution:** Treat names and conceptual similarity as evidence of overlap, not proof that implementations are interchangeable.

<a id="actors-creatures"></a>

## Player, creature, horse, enemy, and experimental mesh systems

Actor assets and world-side populations span player hydration, creature generators, enemies, horses, and experimental animal meshes.

**Related directories:**
- [`assets/models`](assets/models/DIRECTORY_GUIDE.md) — 3D model assets for players and reference worlds.
- [`experiments/animalMesh`](experiments/animalMesh/DIRECTORY_GUIDE.md) — Small experimental mesh-generation surface for animal geometry.
- [`experiments/Awtsmoos/src/app`](experiments/Awtsmoos/src/app/DIRECTORY_GUIDE.md) — Application assembly, boot phases, meadow runtime, render fallbacks, player hydration, and high-level runtime coordination.
- [`experiments/Awtsmoos/src/world/creatures`](experiments/Awtsmoos/src/world/creatures/DIRECTORY_GUIDE.md) — Creature runtime models and world-side creature behavior.
- [`experiments/Awtsmoos/src/world/enemy`](experiments/Awtsmoos/src/world/enemy/DIRECTORY_GUIDE.md) — Enemy actors, populations, state, combat bridges, spawning, and hostile-world behavior.
- [`experiments/Awtsmoos/src/world/horses`](experiments/Awtsmoos/src/world/horses/DIRECTORY_GUIDE.md) — Horse models, movement, population, or world integration.

**Recommended first inspection order:**
1. `assets/models`
2. `experiments/animalMesh`
3. `experiments/Awtsmoos/src/app`
4. `experiments/Awtsmoos/src/world/creatures`
5. `experiments/Awtsmoos/src/world/enemy`
6. `experiments/Awtsmoos/src/world/horses`

**Consolidation caution:** Treat names and conceptual similarity as evidence of overlap, not proof that implementations are interchangeable.

<a id="streaming-performance"></a>

## Streaming, LOD, visibility, and performance policy

Large-world loading and frame-budget concerns are separated into streaming, LOD, visibility, and performance modules.

**Related directories:**
- [`experiments/Awtsmoos/src/world/streaming`](experiments/Awtsmoos/src/world/streaming/DIRECTORY_GUIDE.md) — Chunk, district, visibility, collision, and asset streaming for large worlds.
- [`experiments/Awtsmoos/src/lod`](experiments/Awtsmoos/src/lod/DIRECTORY_GUIDE.md) — Level-of-detail selection, distance policies, and scene LOD coordination.
- [`experiments/Awtsmoos/src/world/visibility`](experiments/Awtsmoos/src/world/visibility/DIRECTORY_GUIDE.md) — World visibility policy, culling, and reveal/hide coordination.
- [`experiments/Awtsmoos/src/performance`](experiments/Awtsmoos/src/performance/DIRECTORY_GUIDE.md) — Quality profiles, budgets, timing, capability probes, and performance policy.

**Recommended first inspection order:**
1. `experiments/Awtsmoos/src/world/streaming`
2. `experiments/Awtsmoos/src/lod`
3. `experiments/Awtsmoos/src/world/visibility`
4. `experiments/Awtsmoos/src/performance`

**Consolidation caution:** Treat names and conceptual similarity as evidence of overlap, not proof that implementations are interchangeable.

## Exact duplicate basenames

- `DIRECTORY_GUIDE.md` appears in `.` and `assets` and `assets/materials` and `assets/materials/generated` and `assets/materials/generated/catalog` and `assets/materials/local` and `assets/materials/local/terrain` and `assets/materials/local/world` and `assets/materials/local/world/awtsmoos-nature` and `assets/materials/local/world/awtsmoos-nature/chai-forest` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark/Bark001_1K-JPG` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark/Bark002_1K-JPG` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark/Bark003_1K-JPG` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark/Bark004_1K-JPG` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark/Bark006_1K-JPG` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark/Bark007_1K-JPG` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark/Bark008_1K-JPG` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark/Bark012_1K-JPG` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark/Bark013_1K-JPG` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark/Bark014_1K-JPG` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/bark/Bark015_1K-JPG` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/ground` and `assets/materials/local/world/awtsmoos-nature/chai-forest/textures/leaves` and `assets/materials/local/world/awtsmoos-nature/ilanos` and `assets/materials/local/world/awtsmoos-nature/ilanos/trees` and `assets/materials/local/world/catalog` and `assets/materials/local/world/full-resolution` and `assets/materials/local/world/processed` and `assets/materials/local/world/processed/botany` and `assets/materials/local/world/various` and `assets/models` and `assets/models/player` and `assets/models/reference-world` and `assets/textures` and `experiments` and `experiments/Awtsmoos` and `experiments/Awtsmoos/src` and `experiments/Awtsmoos/src/app` and `experiments/Awtsmoos/src/assets` and `experiments/Awtsmoos/src/bundles` and `experiments/Awtsmoos/src/camera` and `experiments/Awtsmoos/src/collision` and `experiments/Awtsmoos/src/diagnostics` and `experiments/Awtsmoos/src/diagnostics/logs` and `experiments/Awtsmoos/src/gameplay` and `experiments/Awtsmoos/src/gameplay/actionbar` and `experiments/Awtsmoos/src/gameplay/combat` and `experiments/Awtsmoos/src/input` and `experiments/Awtsmoos/src/launcher` and `experiments/Awtsmoos/src/lod` and `experiments/Awtsmoos/src/math` and `experiments/Awtsmoos/src/motion` and `experiments/Awtsmoos/src/movie` and `experiments/Awtsmoos/src/movie/audio` and `experiments/Awtsmoos/src/movie/package` and `experiments/Awtsmoos/src/network` and `experiments/Awtsmoos/src/performance` and `experiments/Awtsmoos/src/render` and `experiments/Awtsmoos/src/test` and `experiments/Awtsmoos/src/test/app` and `experiments/Awtsmoos/src/test/assets` and `experiments/Awtsmoos/src/test/botany` and `experiments/Awtsmoos/src/test/camera` and `experiments/Awtsmoos/src/test/collision` and `experiments/Awtsmoos/src/test/diagnostics` and `experiments/Awtsmoos/src/test/gameplay` and `experiments/Awtsmoos/src/test/gameplay/combat` and `experiments/Awtsmoos/src/test/geometry` and `experiments/Awtsmoos/src/test/ground` and `experiments/Awtsmoos/src/test/input` and `experiments/Awtsmoos/src/test/launcher` and `experiments/Awtsmoos/src/test/lod` and `experiments/Awtsmoos/src/test/movie` and `experiments/Awtsmoos/src/test/network` and `experiments/Awtsmoos/src/test/performance` and `experiments/Awtsmoos/src/test/platform` and `experiments/Awtsmoos/src/test/render` and `experiments/Awtsmoos/src/test/renderer` and `experiments/Awtsmoos/src/test/shadows` and `experiments/Awtsmoos/src/test/streaming` and `experiments/Awtsmoos/src/test/support` and `experiments/Awtsmoos/src/test/ui` and `experiments/Awtsmoos/src/test/visibility` and `experiments/Awtsmoos/src/test/world` and `experiments/Awtsmoos/src/ui` and `experiments/Awtsmoos/src/world` and `experiments/Awtsmoos/src/world/botany` and `experiments/Awtsmoos/src/world/creatures` and `experiments/Awtsmoos/src/world/enemy` and `experiments/Awtsmoos/src/world/forest` and `experiments/Awtsmoos/src/world/grass` and `experiments/Awtsmoos/src/world/horses` and `experiments/Awtsmoos/src/world/house` and `experiments/Awtsmoos/src/world/lighting` and `experiments/Awtsmoos/src/world/materials` and `experiments/Awtsmoos/src/world/npc` and `experiments/Awtsmoos/src/world/platform` and `experiments/Awtsmoos/src/world/primitives` and `experiments/Awtsmoos/src/world/proceduralApi` and `experiments/Awtsmoos/src/world/proceduralText` and `experiments/Awtsmoos/src/world/road` and `experiments/Awtsmoos/src/world/room` and `experiments/Awtsmoos/src/world/sky` and `experiments/Awtsmoos/src/world/streaming` and `experiments/Awtsmoos/src/world/terrain` and `experiments/Awtsmoos/src/world/trees` and `experiments/Awtsmoos/src/world/village` and `experiments/Awtsmoos/src/world/visibility` and `experiments/Awtsmoos/tests` and `experiments/Awtsmoos/tests/assets` and `experiments/Awtsmoos/tests/gameplay` and `experiments/Awtsmoos/tests/world` and `experiments/Awtsmoos/tools` and `experiments/Awtsmoos/tools/diagnostics` and `experiments/Awtsmoos/tools/materials` and `experiments/animalMesh` and `experiments/light-three-gltf` and `experiments/light-three-gltf/test` and `movies` and `movies/evidence` and `movies/evidence/chossid-journey-30s-corrected` and `movies/projects` and `movies/tools` and `movies/tools/exact` and `references` and `references/canonical-procedural-village` and `styles`.
- `materials.json` appears in `assets/materials/generated/catalog` and `assets/materials/local/world/catalog`.
- `processed-botany-petal-soft-3a2e2015.svg` appears in `assets/materials/generated` and `assets/materials/local`.
- `README.md` appears in `movies` and `references/canonical-procedural-village`.

## Important exact-name collision

- `WorldTargetCoordinator.js` is canonical under `src/ui`; the former world-targeting duplicate was merged into adapters and removed.
- Former same-name test pairs were renamed by semantic boundary so searches now distinguish their responsibilities.
- `materials.json` exists in generated and local world catalogs. Treat one as generated output and the other as curated source/catalog evidence until their consumers prove otherwise.

## Safe interpretation rule

Documentation may combine knowledge across related systems. Runtime code should only be combined after import tracing, behavior comparison, tests, and browser/runtime verification demonstrate that one implementation can safely replace another.
