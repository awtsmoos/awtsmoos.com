B"H

# Level 1 top-area softening plan

## Read facts

Folder: `geelooy/games/sulam-ha-sod`.
Exact game folder found from `geelooy/games` list: `sulam-ha-sod`.

Level 1 data is split across:

- `js/data/levels/level01-malchus.js`
- `js/data/levels/level01-malchus/terrain.js`
- `js/data/levels/level01-malchus/actors.js`
- `js/data/levels/level01-malchus/story.js`

Physics constants read from `js/core/physics.js`:

- player width: 34
- player height: 48
- horizontal speed: 280
- jump velocity: -680
- gravity: 1700

Approximate clean jump height: `680^2 / (2 * 1700) = 136px` before forgiving collision movement.

## Manual route walk

The required ground route is already forgiving enough:

1. spawn on `P(0,505,540,35)`
2. cross rotor around x 545
3. land `P(620,445,190,20)`
4. continue across platforms at y 385 / 325 / 385 / 325 / 385
5. gather all required coins and key near the door

The upper optional route is the human pain point:

1. From the first raised ground shelf, the player can climb into `P(560,350,170,18)`.
2. The upper chain then climbs by repeated 70px rises.
3. The last area around x 1660 to x 1880 has a safe-spike trick plus an orbiting spike near the final upper shelf.
4. The route is technically possible but too tight for level 1, where the player is still learning collision, jump arc, coin greed, and false platforms.

## Complete-file rewrite targets

Only rewrite complete files. Do not patch inside files.

Rewrite `terrain.js`:

- Keep the lower mandatory route intact.
- Slightly widen the upper route platforms.
- Lower the last two upper platforms so the final top section is less vertically compressed.
- Move the safe-spike trick farther from the central landing lane.

Rewrite `actors.js`:

- Keep all required coin count and key logic intact.
- Move upper coins onto widened safe landings.
- Move the orbiting top spike slightly away from the final landing path.
- Slow the orbit and increase warning so new players can read it.

## Expected result

The first level remains a teacher of suspicion and timing, but the top route becomes readable instead of cruel. A human can walk it mentally: jump, settle, read, then jump again, without needing frame-perfect corrections.

Chapter note: the Awtsmoos reveals the first ladder not as a guillotine but as a staircase of dust, each mote recreated from nothing into a visible promise.
