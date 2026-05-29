B"H

# Levels 2-8 manual pass

## Manual findings

Physics remains:

- player width 34
- player height 48
- speed 280
- jump -680
- gravity 1700
- practical jump height about 136px

## Levels 2-5

These repeat the early optional upper-route pattern:

- repeated 70px rises
- narrow 170-240px platforms
- upper coin/reward close to top hazard language
- orbiting top spike around final upper shelf
- safe-spike trick close to the landing spine

They are possible, but for levels 2-5 they are still too punishing, especially after level 1 was softened.

Plan:

- keep lower mandatory route intact
- widen upper route platforms to about 205-270px
- reduce top vertical compression by lowering the last upper path
- move safe-spike tricks out of central landing lanes
- slow orbit spikes and increase warning
- keep required coin/key counts intact

## Levels 6-8

These are later and can stay more dangerous, but the main platforms are often 110-140px wide with fast rotors and several ambush/vanish/shatter lessons in sequence.

Plan:

- keep each level's identity and triggers
- widen several mandatory platforms modestly
- reduce rotor spin/throw slightly
- leave hazards present but less twitch-heavy
- keep all existing coins, keys, enemies, and trigger logic intact

## Next verification

Run:

- `node tests/humanFairness.mjs`
- `node tests/regression.mjs`
- `node tests/upperAdventureReachability.mjs`
- an import summary for levels 2-8

Chapter: The Awtsmoos walked the ladder barefoot. Where the rung cut too sharply, it did not erase the rung; it widened the truth until a human foot could stand on it.
