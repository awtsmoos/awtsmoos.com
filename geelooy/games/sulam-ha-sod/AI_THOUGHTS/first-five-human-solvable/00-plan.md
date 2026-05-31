B"H

# First Five Human-Solvable Rewrite Plan

The visible project root is `/storage/emulated/0/Documents/git/awtsmoos.com`; the requested game lives in `geelooy/games/sulam-ha-sod`.

## Root structure seen

- Main repo has `.awtsmoos`, `AI_THOUGHTS`, `geelooy`, `tests`, scripts, package files, and server entry files.
- Sulam HaSod has `index.html`, `css`, `js/core`, `js/data`, `js/systems`, `js/render`, `tests`, and previous audit notes.
- Levels 1-5 are already split into `terrain.js`, `actors.js`, `story.js`, and wrapper level files.

## Current risk discovered

The level index enriches every raw level through `enrichLevel`. That means even a careful hand-authored level 1 receives extra sky vaults, devil layers, reactive traps, and legacy hardening after the raw file is loaded. The screenshot at level 1 shows crowded upper geometry consistent with those overlays. Therefore merely widening one ledge in level 1 is not enough.

## Manual fix strategy

1. Rewrite level 1-5 terrain files as honest, readable main routes.
2. Rewrite level 1-5 actor files so every real coin and key sits on or just above reachable landings.
3. Keep each file complete, small, and modular; no partial patching.
4. Rewrite `levels.js` completely so levels 1-5 stay hand-authored and are not auto-enriched, while levels 6-51 still use existing enrichment.
5. Run syntax/import checks and the existing fairness tests.
6. Run a small reachability audit focused on the first five using player size, jump height, and conservative jump gaps.

## Human reachability numbers used

Physics says player is 34x48, speed 280, jump velocity -680, gravity 1700. Peak jump height is about 136px, so every planned upward step stays below 80px, and horizontal gaps stay around 90px to 160px between platform edges. Most shelves are 220px+ wide so mobile controls have recovery room.

## The chapter inside the code

The Awtsmoos speaks the first five gates again: dust, mirror, library, garden, court. The cruelty is not erased; it is made readable. The player should have to jump, steer, pause, and learn, but never be forced into a blind ceiling-tooth corridor before the first ladder has even taught the body how high it can rise.
