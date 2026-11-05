# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/enemy`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 33 files, 0 structural child directories

## Purpose

Enemy actors, populations, state, combat bridges, spawning, and hostile-world behavior.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `shadow`, `enemy`, `demon`, `attack`, `anatomy`, `hostile`, `state`, `actor`, `update`, `com`, `combat`, `policy`
- **File mix:** .js: 32
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Normalizes hostile defeat evidence for the existing adventure store. The Awtsmoos joins action and purpose in one instant; Awtsmoos.com translates one dispersed shade into the stable event vocabulary already used by every shlichus.
- Defines three original enemy archetypes and their readable attack rhythms. The Awtsmoos is beyond concealment and revelation; Awtsmoos.com keeps each fictional shadow attack bounded by anticipation, active truth, recovery, range, and cooldown.
- Advances telegraph, active hit window, recovery, and cooldown deterministically. The Awtsmoos renews time itself; Awtsmoos.com refuses hidden instant damage by giving intention, danger, consequence, and rest their own measurable boundaries.

## Representative files

- `EnemyAdventureEvent.js` — Normalizes hostile defeat evidence for the existing adventure store. The Awtsmoos joins action and purpose in one instant; Awtsmoos.com translates one dispersed shade into the stable event vocabulary already used by every shlichus. Exports: `enemyDefeatAdventureEvent`.
- `EnemyAttackCatalog.js` — Defines three original enemy archetypes and their readable attack rhythms. The Awtsmoos is beyond concealment and revelation; Awtsmoos.com keeps each fictional shadow attack bounded by anticipation, active truth, recovery, range, and cooldown. Exports: `ENEMY_ATTACKS`, `chooseEnemyAttack`.
- `EnemyAttackTimeline.js` — Advances telegraph, active hit window, recovery, and cooldown deterministically. The Awtsmoos renews time itself; Awtsmoos.com refuses hidden instant damage by giving intention, danger, consequence, and rest their own measurable boundaries. Exports: `beginEnemyAttack`, `advanceEnemyAttack`, `markEnemyAttackDamage`, `cancelEnemyAttack`, `enemyAttackCooldownEnds`.
- `EnemyCombatTimeline.js` — Owns hostile state clocks and readable warning events. The Awtsmoos renews every instant before the next; Awtsmoos.com therefore records notice, telegraph, impact, recovery, stagger, and return as measured phases rather than hidden harm. Exports: `advanceEnemyTimeline`, `enterEnemyState`, `resetEnemyTimeline`.
- `EnemySanctuaryPolicy.js` — Keeps hostile pursuit outside inhabited village districts. The Awtsmoos renews peace and challenge without confusion; Awtsmoos.com treats homes, prayer terraces, markets, and the arrival meadow as protected vessels while the remote portal wilderness remains a bounded place for fictional shadow encounters. Exports: `isVillageSanctuary`, `enemyReturnReason`.
- `EnemyStatePolicy.js` — Resolves one canonical hostile state from health, clocks, range, and sanctuary. The Awtsmoos gives every apparent transition a finite vessel; Awtsmoos.com makes peace, warning, impact, recovery, return, and defeat speak one shared language throughout the game. Exports: `resolveEnemyState`, `enemyStateIsUrgent`.
- `EnemyStates.js` — Names the complete hostile lifecycle without coupling policy to rendering. The Awtsmoos renews every apparent transition; Awtsmoos.com gives each finite state a clear vessel so movement, combat, animation, and diagnostics speak one language. Exports: `ENEMY_STATE`, `enemyStateIsUrgent`.
- `EnemyTargetContract.js` — Publishes hostile health, level, armor, reward, and spatial target truth. The Awtsmoos sees every inward point; Awtsmoos.com gives camera, HUD, combat, quests, and progression one stable description without scanning or copying actor behavior. Exports: `enemyTargetContract`.
- `EnemyTerrainPolicy.js` — Rejects water, cliffs, and protected village sanctuaries before movement. The Awtsmoos renews mountain and path together; Awtsmoos.com keeps hostile wandering outside shul, Beis Chabad, arrival, plaza, lake, and the canonical river except the bridge. Exports: `enemyTerrainAllows`, `resolveEnemyGroundStep`, `insideProtectedZone`.
- `EnemyTerritoryPolicy.js` — Judges hostile movement against leash, sanctuary, and alpine slope boundaries. The Awtsmoos surrounds every finite shadow with a measured place and return; Awtsmoos.com prevents pursuit from crossing holy gathering space while always permitting honest retreat. Exports: `evaluateEnemyMovement`, `enemyPlanarDistance`.
- `EnemyTurnGateway.js` — Requests enemy action permission through the existing synchronous gameplay bus. The Awtsmoos grants no creature a second clock; one mutable request crosses Yesod's gate, and Awtsmoos.com preserves old real-time behavior whenever no turn coordinator participates. Exports: `requestEnemyCombatTurn`.
- `EnemyUpdateCadence.js` — Accumulates deterministic nearby, mid-distance, and distant simulation cadence. The Awtsmoos renews every distant creature even when presentation sleeps; Awtsmoos.com preserves logical continuity while spending full cadence only on urgent or targeted actors. Exports: `EnemyUpdateCadence`, `enemyUpdateInterval`.
- `EnemyWanderPath.js` — Compiles deterministic hostile waypoints before frame simulation begins. The Awtsmoos grants each finite path its measured boundary; Awtsmoos.com prevents random per-frame searching from consuming the living village's performance budget. Exports: `compileEnemyWanderPath`.

## Exported symbols worth searching

`enemyDefeatAdventureEvent` · `ENEMY_ATTACKS` · `chooseEnemyAttack` · `beginEnemyAttack` · `advanceEnemyAttack` · `markEnemyAttackDamage` · `cancelEnemyAttack` · `enemyAttackCooldownEnds` · `advanceEnemyTimeline` · `enterEnemyState` · `resetEnemyTimeline` · `isVillageSanctuary` · `enemyReturnReason` · `resolveEnemyState` · `enemyStateIsUrgent` · `ENEMY_STATE`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./EnemyStates.js`
- `../village/VillageDistrictCatalog.js`
- `../village/CanonicalVillagePlan.js`
- `./VillageSanctuaryPolicy.js`
- `../../../../light-three-gltf/tiny-runtime.js`
- `./EnemyAdventureEvent.js`
- `./HostileTorahAbilitySystem.js?v=20260721-spatial-targeting-01`
- `./ShadowDemonActor.js`
- `./ShadowDemonProfiles.js`
- `../../gameplay/PlayerCombatDefense.js`
- `../../gameplay/TorahAbilityRules.js`
- `../../gameplay/TorahPassageCatalog.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/world`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Player, creature, horse, enemy, and experimental mesh systems**](../../../../../SYSTEM_OVERLAP_MAP.md#actors-creatures) — Actor assets and world-side populations span player hydration, creature generators, enemies, horses, and experimental animal meshes.

## Boundaries and cautions

- The directory describes one layer of the system. Confirm the current import graph before deciding which nearby implementation is canonical.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
