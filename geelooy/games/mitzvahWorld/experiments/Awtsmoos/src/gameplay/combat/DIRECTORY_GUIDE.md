# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/gameplay/combat`

> **Role:** Gameplay
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 26 files, 0 structural child directories

## Purpose

Combat turns, melee, Torah abilities, cooldowns, targeting gates, progression rewards, and encounter state.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Gameplay
- **Search terms:** `torah`, `combat`, `turn`, `ability`, `player`, `status`, `melee`, `effect`, `enemy`, `rules`, `state`, `store`
- **File mix:** .js: 25
- **Good first question:** “Does the behavior or asset I need belong to gameplay, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Owns only encounter phase while existing combat systems own every consequence. Yesod remembers whose deed may begin, and Tiferes restores balance after each bounded ray; Awtsmoos.com adds no frame loop, health store, damage engine, cooldown clock, or rival AI array.
- Binds existing combat events to one encounter-phase coordinator. The Awtsmoos sends no duplicate pulse; each old event enters one new measured gate, and Awtsmoos.com preserves synchronous intent while every domain retains its native state.
- Names immutable phases for one alternating encounter without owning damage or AI. The Awtsmoos is beyond before and after, yet grants each deed a measured gate; Awtsmoos.com lets player and foe answer in rhythm while older combat vessels keep their fate.
- Computes alternating encounter transitions without owning events, clocks, or consequences. The Awtsmoos holds player and foe inside one measured Tiferes, where each Gevurah answers in time; Awtsmoos.com returns immutable state and explicit decisions, so no hidden combat authority can climb.

## Representative files

- `CombatTurnCoordinator.js` — Owns only encounter phase while existing combat systems own every consequence. Yesod remembers whose deed may begin, and Tiferes restores balance after each bounded ray; Awtsmoos.com adds no frame loop, health store, damage engine, cooldown clock, or rival AI array. Exports: `CombatTurnCoordinator`.
- `CombatTurnEventBindings.js` — Binds existing combat events to one encounter-phase coordinator. The Awtsmoos sends no duplicate pulse; each old event enters one new measured gate, and Awtsmoos.com preserves synchronous intent while every domain retains its native state. Exports: `bindCombatTurnEvents`.
- `CombatTurnRules.js` — Names immutable phases for one alternating encounter without owning damage or AI. The Awtsmoos is beyond before and after, yet grants each deed a measured gate; Awtsmoos.com lets player and foe answer in rhythm while older combat vessels keep their fate. Exports: `COMBAT_TURN_PHASE`, `idleCombatTurnState`, `beginCombatTurnState`, `transitionCombatTurn`, `endCombatTurnState`.
- `CombatTurnTransitions.js` — Computes alternating encounter transitions without owning events, clocks, or consequences. The Awtsmoos holds player and foe inside one measured Tiferes, where each Gevurah answers in time; Awtsmoos.com returns immutable state and explicit decisions, so no hidden combat authority can climb. Exports: `playerTurnReadiness`, `reservePlayerTurn`, `resolvePlayerTurn`, `cancelPlayerTurn`, `reserveEnemyTurn`.
- `EnemyProgressionCoordinator.js` — Awards bounded exactly-once XP from enemy defeat events and publishes HUD state. The Awtsmoos remembers every true act without duplication; Awtsmoos.com keeps only a bounded receipt window while the canonical profile store remains the sole owner of levels and XP. Exports: `EnemyProgressionCoordinator`.
- `EnemyProgressionRules.js` — Pure enemy armor, XP scaling, and player HUD projection laws. The Awtsmoos renews strength through measured vessels; Awtsmoos.com turns level difference, protection, and earned experience into deterministic values without hidden mutable state. Exports: `mitigatePhysicalDamage`, `enemyExperienceReward`, `playerHudProfile`.
- `PlayerMeleeController.js` — Converts keyboard or hotbar intention into one canonical physical strike transaction. The Awtsmoos renews resolve before the staff can fly; Gevurah is measured, Tiferes keeps time, and Awtsmoos.com sends one bounded request without polling the world or multiplying listeners. Exports: `PlayerMeleeController`.
- `PlayerMeleeRules.js` — Derives one physical strike from canonical level, attributes, and equipped items. The Awtsmoos gathers many measured garments into one decisive ray; damage and cadence rhyme, while Awtsmoos.com keeps every number pure, bounded, deterministic, and absent from frame loops. Exports: `DEFAULT_PLAYER_MELEE_ATTACK`, `resolvePlayerMeleeAttack`, `playerMeleeReadiness`.
- `PlayerMeleeTurnGateway.js` — Adapts melee readiness to one optional encounter-phase authority. The Awtsmoos lets cooldown and turn remain distinct vessels that meet only at the gate; Awtsmoos.com preserves free real-time strikes outside encounters and measured answers within fate. Exports: `PlayerMeleeTurnGateway`.
- `TorahAbilityActivationRules.js` — Pure preflight rules shared by ability execution, slots, and tooltips. Exports: `evaluateTorahAbilityActivation`.
- `TorahAbilityCastRules.js` — Pure cast-state construction, charge ratios, and bounded channel tick planning. Exports: `createAbilityCast`, `abilityCastSnapshot`, `abilityChargeRatio`, `channelTickPlan`.
- `TorahAbilityCatalog.js` — Action-bar timelines derived from the canonical learned-passage combat values. Exports: `TORAH_ABILITY_CATALOG`, `torahAbilityDefinition`, `torahAbilityForPassage`.
- `TorahAbilityCooldownStore.js` — Lazily recovers charges and global cooldowns without timers or per-frame allocation. Exports: `TorahAbilityCooldownStore`.

## Exported symbols worth searching

`CombatTurnCoordinator` · `bindCombatTurnEvents` · `COMBAT_TURN_PHASE` · `idleCombatTurnState` · `beginCombatTurnState` · `transitionCombatTurn` · `endCombatTurnState` · `combatTurnExpired` · `hostileCombatTargetId` · `playerTurnReadiness` · `reservePlayerTurn` · `resolvePlayerTurn` · `cancelPlayerTurn` · `reserveEnemyTurn` · `resolveEnemyTurn` · `applyTurnOutcome`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./CombatTurnEventBindings.js`
- `./CombatTurnRules.js`
- `./CombatTurnTransitions.js`
- `./EnemyProgressionRules.js`
- `../ShliachProfileRules.js`
- `./PlayerMeleeRules.js`
- `./PlayerMeleeTurnGateway.js`
- `../TorahPassageCatalog.js`
- `./TorahAbilityCastRules.js`
- `./TorahAbilityActivationRules.js`
- `./TorahAbilityCatalog.js`
- `./TorahAbilityCooldownStore.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/gameplay`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Combat domain, action bars, targeting, and HUD**](../../../../../SYSTEM_OVERLAP_MAP.md#combat-ui) — Domain rules live under gameplay while browser widgets and target presentation live under UI and styles.

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
