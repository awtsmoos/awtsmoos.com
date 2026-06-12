B'H
# Fox Rewrite Audit

User showed the truth: fox still circled, still looked bad. Real cause found in source:
- `preferredRange = attackRange + 0.9` forced orbit outside attack range.
- `navigator.move(... stopDistance=this.preferredRange)` encoded endless circling.

Completed changes:
1. `VillageAnimalFactory.js` fully rewritten into named procedural anatomy rig:
   - fox/wolf: rib cage, hips, pale chest, headRoot, pointed muzzle, nose, ears, eyes, four segmented legs, paws, tailRoot, white tail tip.
   - ram/stag: barrel body, chest, headRoot, muzzle, horns/antlers, legs, paws, tail.
   - exports preserved: `createVillageAnimal`, `disposeVillageAnimal`.
2. `VillageAnimalMob.js` fully rewritten into finite state machine:
   - patrol -> chase -> windup -> strike -> recover.
   - no more preferredRange outside attackRange.
   - chase closes to hit range.
   - windup creates warning ring and emissive flash.
   - strike lunges and calls player damage once.
   - recover backs away to prevent overlap.
   - debug state written to mesh userData.
3. Cache-busting import rewrites:
   - `GeneratedBattleLayer.js` imports new mob URL.
   - `MitzvahWorldPostBuild.js` imports new battle layer URL.
   - `loadNivrayim/index.js` imports new postbuild URL.

Verification:
- JS syntax checks passed on rewritten files by tunnel write verification.
- `launchPreview` returned 200 HTML.

Remaining:
- I still did not get an actual visual/browser replay of the fox hitting the player; user should hard refresh / cache-clear reload if Chrome tab has old module graph.
- If still stale, next parent import above loadNivrayim or top index script cache needs bumping.

Chapter: The fox no longer receives a command to orbit. The ring was broken. The meadow has phases now: breath, warning, bite, recoil.