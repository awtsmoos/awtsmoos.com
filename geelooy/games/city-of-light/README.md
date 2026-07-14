# B"H
# Boruch Hashem
# Blessed is He

# City of Light: The Complete Pilgrimage

City of Light is a dependency-free 24-chapter campaign for Awtsmoos.com. Every district is generated from a reproducible seed, but each chapter has an authored mission, region, wildlife population, environmental identity, and progression purpose.

## Campaign

The pilgrimage crosses six four-chapter regions:

1. Courtyards of Dawn — sparks, shrines, checkpoints, and the Swift Light dash.
2. Garden Paths — deer, doves, foxes, sanctuaries, and the Call of Kindness.
3. River of Mirrors — paired bridge stones, lanterns, mist, and the Bridge Song.
4. Archive of Echoes — owl-guided sequences, memory paths, and Echo Sight.
5. Heights of Gold — raised courts, honest ramps, wind, and the Wind Step.
6. Heart of the City — four long chapters combining every learned system.

## Production guarantees

Generation does not finish merely because a maze exists. Every chapter is rejected unless:

- every walkable tile belongs to the spawn-connected component;
- every raised platform cell is reachable;
- every platform has at least two reachable ramps;
- every spark, landmark, checkpoint, sanctuary, and beacon is reachable;
- every animal begins on a valid tile;
- every animal patrol consists of contiguous walkable steps;
- every mission stage has enough real bound targets;
- the complete mission sequence can be satisfied in order;
- identical seeds reproduce identical worlds.

## Living systems

- Five procedural species: dove, deer, fox, owl, and firefly.
- Path-aware patrol, following, listening, flocking, sanctuary, and perch-like behavior.
- Procedural wings, gait, antlers, ears, tails, eyes, glows, and following rings.
- Player breathing, gait lean, landing pulse, dash stretch, crown, and orbit motion.
- Seeded rain, mist, leaves, dustlight, aurora, and crownlight particles.
- Camera easing, mission pulses, a truthful minimap, distinct landmarks, and raised terrain.
- Generated WebAudio cues with a working mute setting.

## Progress and accessibility

The campaign stores chapter completion, unlocks, abilities, best times, total light, settings, and seed through a versioned save repository that recovers safely from malformed data.

Controls include keyboard, WASD, touch movement, interact/call, dash, mission reveal, pause, checkpoint restart, chapter restart, chapter selection, reduced motion, high contrast, and mute.

## Verification

```bash
npm test
npm run test:stress
npm run test:browser
npm run test:all
```

- `npm test` verifies campaign data, saves, wildlife, and 288 complete generated chapters.
- `npm run test:stress` validates 2,400 complete generated chapters across 100 seeds.
- `npm run test:browser` enters the real campaign in Chrome, watches wildlife animation, moves, dashes, pauses, changes settings, selects a chapter, reloads persistent progress, captures a screenshot, and verifies the arcade doorway.

The Awtsmoos is not revealed through random rooms called content. The city becomes worthy of its name when every road can be walked, every creature has a path, every mission can finish, and the tests return from thousands of worlds carrying proof.