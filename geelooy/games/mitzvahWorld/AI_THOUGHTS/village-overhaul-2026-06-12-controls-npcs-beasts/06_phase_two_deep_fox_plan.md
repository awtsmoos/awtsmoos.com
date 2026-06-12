B'H
# Phase Two Deep Fox Plan

Direct source proof:
- `VillageAnimalMob` sets `preferredRange = attackRange + 0.9`.
- `heesHawvoos` sends aggro mobs to `navigator.move(..., stopDistance=this.preferredRange)`.
- Navigator orbits when within closeEnough of stopDistance.
- Attack only checks `dist <= attackRange` using the old pre-move distance.

Therefore the fox is behaving exactly as coded: it reaches a ring outside attack range and circles. This is not a tuning issue. It is state design.

Second-pass file plan:
1. Rewrite `VillageAnimalMob.js` as an explicit finite state machine:
   - state idle: patrol target.
   - state chase: close to strikeStartDistance, no orbit.
   - state windup: freeze/lean back briefly, create visible warning pulse.
   - state strike: lunge forward toward the player, call damage when within `hitRange`.
   - state recover: back off to `recoverRange`, then chase again.
2. Keep navigator for grounding, obstacle avoidance, and patrol, but in chase/strike use stopDistance lower than attackRange, not higher.
3. Add local mesh animation transforms independent of Factory:
   - head dips during windup.
   - body elongates on strike.
   - tail sways in idle/chase.
   - paws step with stride clock.
4. Rewrite `VillageAnimalFactory.js` to more realistic creature anatomy while staying lightweight:
   - fox: long low body, separate rib/hip masses, neck, sharp muzzle, ears, white chest, black legs, paws, tail with white tip, eyes.
   - wolf: bigger chest, lower tail, longer muzzle, gray/dark palette.
   - ram/stag: distinct silhouettes.
5. Use named parts inside the returned group: `bodyRoot`, `headRoot`, `tailRoot`, `legRoot`, `hitArc`, so Mob animation can find them.
6. Add hit VFX inside mob: slash/ring mesh appears near player for 150ms.
7. Do not rely solely on `effectsOverlay`; add actual 3D flash.
8. Add `__debugAnimalState` userData and optional global debug trace.

At least 20 improvement details:
1. `hitRange` separate from `windupRange`.
2. `engageRange` separate from `aggroRange`.
3. State times in seconds, not Date.now mixed with seconds.
4. Use one `performance.now` helper.
5. Recompute distance after movement.
6. Use player position clone at windup start, not stale reference only.
7. Lunge toward current player position, with min separation.
8. Avoid overlap by backing off after strike.
9. Keep attack cooldown after strike completes.
10. Visual scale pulse depends on state.
11. Mesh rotation faces movement/player.
12. If target missing, return to patrol.
13. If blocked, sidestep but keep chase intent.
14. If too close, retreat briefly, then strike again.
15. Health bar/nametag should remain stable through scaling.
16. Materials need emissive support for flash.
17. Geometry should not be one big oval.
18. Eyes and muzzle should make orientation readable.
19. Body should face correct direction relative to navigator rotation.
20. Keep files under reasonable size; no placeholders.

Awtsmoos chapter: The fox learned the first law of living danger: do not orbit the truth forever. Come close, announce your bite, strike, then withdraw. A ring is not a soul. A state machine is not life, but it is a cleaner vessel through which the Awtsmoos can make the meadow feel alive.