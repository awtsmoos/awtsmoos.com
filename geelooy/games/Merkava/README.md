<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
<!--
	Documentation preserves the road without pretending it is the road.
	The Awtsmoos recreates code, player, route, and world while Awtsmoos.com reveals the vessel.
-->
# Merkava: War of the Sparks

A raw-WebGL three-lane army roguelite about gathering holy sparks, collecting Prutahs,
choosing arithmetic gates and seeded routes, building Sefirah paths, crossing five worlds,
and confronting multi-phase bosses through Campaign or Endless play.

## Active runtime

- Entry: `index.html` → `src/main.js` → `src/app/MerkavaApp.js`
- Renderer: local raw WebGL only
- Meshes: `/geelooy/libs/awtsmoos-procedural`
- No Three.js dependency, namespace, or remote runtime dependency
- Save key: `awtsmoos.merkava.save.v4`; legacy saves migrate through validated defaults

## Controls

- `A` / `D` or arrows: change lane
- Tap or drag the canvas: mobile lane control
- `Space`: activate the charged Merkava command
- `P` or `Escape`: pause
- HUD command button: mobile ability activation

## Run modes

### Campaign

Campaign crosses five worlds and ends after Sar Ha-Hester falls. Each world has five named
levels: introduction, pressure, elite encounter, mixed combat, and a boss. Ordinary level
completion opens a deterministic three-road choice and then a Sefirah blessing. Checkpoint
shrines, boss blessings, and world transitions preserve the authored campaign spine.

### Endless

Endless rotates through the same five mechanically distinct worlds without declaring a
campaign victory. Each completed rotation advances a deterministic cycle and increases
bounded road speed, encounter cadence, enemy depth, boss endurance, attack cadence, and
Prutah rewards. Continue restores the exact mode, cycle, route seed, and strategic build.

## Seeded route system

Each run receives one persisted unsigned seed. At ordinary non-checkpoint level boundaries,
the route generator offers three unique roads: one guaranteed low-risk Guarded Road and two
seed-ranked alternatives. Roads expose risk and reward before selection and apply real,
bounded effects to sparks, health, shields, command charge, Prutahs, score, lasting damage,
or future Prutah value. Offered choices are validated, selected history is capped, malformed
save data is repaired, and reload recreates the same strategic route sequence from the seed.

## Worlds

1. Assiyah — formations, barricades, golems, Prince of Dust
2. Yetzirah — curved shots, lightning lanes, ravens, Wheel of the Storm
3. Beriah — shifting arithmetic, corrupters, mirrors, Architect of Mirrors
4. Atzilus — faster beams, elites, white fire, Serpent of White Fire
5. Great Concealment — combined corruption and Sar Ha-Hester

## Strategic systems

- Holy sparks control formation size, firing density, and survival.
- Prutahs appear in trails, risky lanes, drops, elite rewards, routes, and boss showers.
- Consecutive collection increases combo value; golden Prutahs are worth more.
- Checkpoint prices rise after purchases and as worlds deepen.
- Temporary upgrades alter sparks, damage, fire rate, side shots, piercing, shields,
  magnetism, Prutah value, positive gates, and between-level healing.
- Blessings level Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod, Malchut, and Keter.
- Named cross-Sefirah synergies change combat and economy.
- The first checkpoint chooses Light Burst, Gathering Call, or Shofar Blast.
- Elite shells grant run-changing relics with implemented effects.

## Enemies and bosses

Enemy behaviors include infantry, golems, ravens, archers, drainers, splitters, summoners,
gate corrupters, thieves, elites, and breakable obstacles. Bosses expose names, health,
phases, warned unsafe lanes, summons, rage pressure, and rewards. Endless scaling copies
and bounds boss values without replacing mechanics or readable counterplay.

## Persistence

Versioned validation repairs malformed values and migrates partial saves through defaults.
The save stores permanent Prutahs, upgrades, Campaign and Endless records, capped history,
relic discoveries, settings, and one strategic checkpoint. Continue restores mode, cycle,
route seed and history, world, level, army, build, relics, command, and economy while
rebuilding transient combat and visible route cards.

## Architecture

- `src/app/`: composition, lifecycle, menus, strategic choices, diagnostics
- `src/routes/`: route catalog, seed mixing, pure generation, effects, facade
- `src/modes/`: mode catalog and pure bounded Endless rules
- `src/game/`: state, progression, encounters, enemies, bosses, relics, collision
- `src/render/`: raw-WebGL resources, procedural meshes, focused passes
- `src/ui/`: HUD, overlays, mode labels, events, arithmetic labels
- `src/audio/`: optional Web Audio with graceful failure
- `src/persistence/`: migration, records, history, routes, checkpoints
- `src/config/`: campaign, economy, limits, colors, quality caps
- `test/`: deterministic rules, structural audits, Campaign and Endless CDP flows

All inspected source vessels remain at 120 lines or fewer and use tabs for code indentation.

## Verification

```sh
npm run verify
npm run verify:browser
```

`npm run verify` runs deterministic tests, syntax checks, the Three.js prohibition audit,
and the file-size/tab audit. `verify:browser` drives boot, mode selection, Endless rollover,
route choice, blessing, checkpoint reload, input, abilities, shops, bosses, hazards, records,
and continuation. It writes JSON and screenshot evidence under `ai_thoughts`.

## Diagnostics and future work

`window.__MERKAVA_DIAGNOSTICS__` exposes mode, seed, route step, offers, route history,
route modifier, cycle, pressure, world, level, lane, sparks, health, shield, Prutahs, build,
enemies, boss state, timing, errors, renderer identity, and mesh registration. Optional future
modes remain daily seed, boss rush, one-spark, no-shop, speed trial, and Prutah challenge,
followed by a richer visual node-map presentation, seed sharing, expanded scenery, adaptive
music, and broader accessibility presets. No decorative modes are exposed.
