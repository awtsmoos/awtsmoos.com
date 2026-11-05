B"H
Boruch Hashem
Blessed be He

# 01 — World Selection, Boot, Saves, and Streaming

## Required official worlds
- [ ] `Blank Meadow`: grass + dirt blend + subtle terrain + sky + collision + player + movement + Creator. Absolutely no trees, NPCs, houses, rivers, quests, enemies, combat, animals, or heavy simulation unless the user adds them.
- [ ] `Living Village`: real canonical village with usable houses/doors/interiors, NPC residents/schedules, roads/paths, trees, river/stream, bridge, wells/water, orchards/flowers, animals, ambient sound, basic economy, quests, and persistence.
- [ ] `Great Valley`: village plus streamed mountain/forest/highland packages, waterfalls, wildlife, expanded hydrology, deeper weather/ecology, and large-region traversal.
- [ ] `Living City & Countryside`: only expose after a distinct real city authority exists; never silently route to Village.
- [ ] Later official candidates: Procedural Wilderness, Deep Forest, Mountain Valley, Riverlands, Desert/Dry Highlands, Winter World, Weather Laboratory, Random World.
- [ ] Developer-only worlds: Performance Torture, Physics Lab, Vegetation Gallery, Hydrology Lab, NPC Civilization Lab, Asset Gallery.

## Existing launcher foundation to extend
- `world/experience/MitzvahWorldExperienceCatalog.js`
- `launcher/WorldBrowserModel.js`
- `launcher/WorldBrowserView.js`
- `launcher/MitzvahWorldSinglePlayerRuntimeOptions.js`
- `app/createEretzRuntime.js`
- `app/EretzPostPlayableWorldPolicy.js`
- `app/EretzPostPlayablePriority.js`

Do not create a competing selector.
## World manifest contract
Every official world should be an immutable manifest containing:
- stable world/template ID and schema version;
- seed and procedural-version pin;
- terrain/climate/biome recipe;
- feature flags for combat, quests, map, Creator, houses, NPCs, animals, trees, water, weather, districts, deep streaming;
- starting position and safe spawn;
- required assets versus optional enrichment;
- graphics/simulation budget class;
- save compatibility/migration information.

## Critical feature-policy work
- [ ] Attach selected `worldExperience` to the live runtime before bootstrap systems mount.
- [ ] Make bootstrap combat conditional; Blank Meadow must not construct it.
- [ ] Make minimap optional per manifest.
- [ ] Make cinematic environment, landscape, hero presentation, terrain hydration, districts, and deferred enrichment individually policy-driven.
- [ ] Rich mounts must consult the same immutable authority for houses, mountains, trees, vegetation, water, NPCs, animals, quests, and targeting.
- [ ] Preserve compatibility aliases for old `simple-meadow` and `local-reference-village` IDs without duplicating runtime truth.
- [ ] Unknown IDs must safely resolve to Blank Meadow, not a rich world.

## Boot acceptance
- [ ] Card click resolves exact world ID.
- [ ] First meaningful frame appears before enrichment.
- [ ] Input visibly moves the player before optional systems settle.
- [ ] Every optional subsystem has a bounded timeout/cancellation path.
- [ ] Network disabled: Blank Meadow still reaches control.
- [ ] Missing weather/catalog/AI/multiplayer: no first-control regression.
- [ ] Cold cache, warm cache, corrupt cache, slow network, and offline boots all tested.
## Saves and world switching
- [ ] Separate immutable template from save instance: e.g. `Living Village` versus `My Village — Day 36`.
- [ ] Save procedural baseline identity plus sparse deltas; never serialize untouched forests/terrain wholesale.
- [ ] Transactional autosave with multiple recovery checkpoints.
- [ ] Corrupt-save detection and rollback.
- [ ] Explicit schema migrations and procedural-generator version pinning.
- [ ] Preserve important stable IDs for trees, buildings, NPCs, quests, builds, bridges, inventories, and world events.
- [ ] World A → B → C → A soak test; memory, Workers, GPU resources, audio nodes, timers, physics, navigation, and network subscriptions must return to baseline.
- [ ] Safe Boot after prior crash: same save, optional enrichment temporarily disabled.
- [ ] Continue/New/Duplicate/Rename/Delete/Export Recipe/Share Seed UX.

## Official-world release ladder
- Tier 0 `Engine Alive`: Blank Meadow boots, renders, collides, and moves.
- Tier 1 `World Alive`: Village has real doors, residents, trees, river, bridge, persistence.
- Tier 2 `Region Alive`: Great Valley streams settlement + wilderness + weather/ecology.
- Tier 3 `Civilization Alive`: schedules, economy, ecology, weather, quests, construction, and persistence interact coherently.

## Rule
No official world appears as playable unless automated testing proves that exact manifest reaches controllable gameplay. Experimental/incomplete worlds belong in Labs and are labeled honestly.