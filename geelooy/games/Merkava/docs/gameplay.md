<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
<!--
	The Awtsmoos renews every spark, road, enemy, and choice while no finite rule sustains itself alone;
	Awtsmoos.com records the authored covenant so future expansion can deepen play without breaking its throne.
-->
# Merkava Gameplay Contract

## Core loop

Merkava is a raw-WebGL three-lane army roguelite about gathering holy sparks,
collecting Prutahs, choosing arithmetic gates and deterministic roads,
building Sefirah paths, and confronting multi-phase bosses.

The run remains readable at every moment:
choose a lane, preserve the army, collect value, survive hazards,
choose strategic rewards, and carry a bounded build deeper into the campaign.

## Controls

- `A` / `D` or arrow keys: change lane.
- Tap or drag the canvas: direct mobile lane control.
- `Space`: activate the charged Merkava command.
- `P` or `Escape`: toggle pause.
- HUD command button: mobile ability activation.

## Campaign

Campaign crosses five worlds and ends after Sar Ha-Hester falls.
Each world contains five authored levels:
introduction, pressure, elite encounter, mixed combat and boss.

Ordinary level completion opens a deterministic three-road decision
and then a Sefirah blessing.
Checkpoint shrines, boss blessings and world transitions preserve the campaign spine.

## Endless

Endless rotates through the same five mechanically distinct worlds
without declaring campaign victory.

Completed rotations advance a deterministic cycle with bounded increases to road speed,
encounter cadence, enemy pressure, boss endurance, attack cadence and Prutah rewards.

Continue restores the exact mode, cycle, route seed and strategic build.

## Seeded roads

Each run owns one persisted unsigned seed.
Ordinary non-checkpoint boundaries offer three unique roads:
one guaranteed low-risk Guarded Road plus two seed-ranked alternatives.

Roads expose risk and reward before selection.
They may alter sparks, health, shields, command charge, Prutahs, score,
lasting damage or future Prutah value.

Offered choices are validated, selected history is capped, malformed saves are repaired,
and reload recreates the same route sequence from the seed.

## Worlds

1. Assiyah — formations, barricades, golems, Prince of Dust.
2. Yetzirah — curved shots, lightning lanes, ravens, Wheel of the Storm.
3. Beriah — shifting arithmetic, corrupters, mirrors, Architect of Mirrors.
4. Atzilus — faster beams, elites, white fire, Serpent of White Fire.
5. Great Concealment — combined corruption and Sar Ha-Hester.

## Strategic systems

- Holy sparks control formation size, firing density and survival.
- Prutahs appear in trails, risky lanes, drops, elite rewards, roads and bosses.
- Consecutive collection increases combo value; golden Prutahs are worth more.
- Checkpoint prices rise after purchases and as worlds deepen.
- Temporary upgrades alter sparks, damage, fire rate, side shots and piercing.
- Other upgrades alter shields, magnetism, Prutah value, gates and healing.
- Blessings level Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod, Malchut and Keter.
- Named cross-Sefirah synergies alter combat and economy.
- The first checkpoint chooses Light Burst, Gathering Call or Shofar Blast.
- Elite shells grant run-changing relics with implemented effects.

## Enemies and bosses

Enemy behaviors include infantry, golems, ravens, archers, drainers, splitters,
summoners, gate corrupters, thieves, elites and breakable obstacles.

Bosses expose names, health, phases, warned unsafe lanes, summons,
rage pressure and rewards.

Endless scaling copies and bounds boss values without replacing mechanics
or readable counterplay.

## Persistence

Save key: `awtsmoos.merkava.save.v4`.

Versioned validation repairs malformed values and migrates partial saves through defaults.
Saves include permanent Prutahs, upgrades, Campaign/Endless records, capped history,
relic discoveries, settings and one strategic checkpoint.

Continue restores mode, cycle, route seed/history, world, level, army, build,
relics, command and economy while rebuilding transient combat and visible road cards.
