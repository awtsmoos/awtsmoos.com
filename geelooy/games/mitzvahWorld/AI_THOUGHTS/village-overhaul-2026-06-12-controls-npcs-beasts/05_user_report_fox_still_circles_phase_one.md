B'H
# Phase One After User Screenshot — Fox Still Circles

User evidence: the animal reaches the player halo and circles/orbits, but does not commit to attack. The visual silhouette is still toy-like: large ovoid body, stub legs, unclear fox anatomy. This proves the previous pass fixed foundations but not the actual attack transition/visual target.

Primary hypotheses:
1. `VillageAnimalMob.heesHawvoos` computes `dist` before navigator moves. If the mob starts outside attackRange, it moves into range but still uses the old pre-move distance for attack check, delaying attacks. If navigator keeps the mob at preferredRange > attackRange, it may never call attack at all.
2. `preferredRange = attackRange + 0.9`, so the navigator intentionally keeps the fox too far away to attack. It circles at preferredRange and never closes. This is the exact symptom.
3. `attackRange` might be smaller than the visible body/halo distance; standing outside attack range looks like circling.
4. The attack can be called, but `player.takeDamage` may not exist on the actual object referenced by `olam.player || olam.chossid` if the world uses another handle.
5. Attack cooldown/windup may happen but no visible effect is obvious because the flash is tiny and the HUD change subtle.
6. Navigator closeEnough behavior chooses orbit when distance is within stopDistance tolerance, guaranteeing circles at standoff radius instead of a lunge state.

Needed architectural fix:
- Build a real finite state machine for animals: idle -> notice -> pursue -> windup -> strike -> recover -> backoff.
- The animal should close to `strikeRange`, not orbit forever at `preferredRange`.
- Orbit should only occur after a strike or when blocked, never while attack is ready.
- Damage should have a clear hit VFX and text near player.
- The model should have a more realistic fox silhouette: lower elongated torso, chest/hips, neck, pointed muzzle, ears, multi-jointed legs, paws, tail with white tip, eyes, snout, layered fur patches.

Files to inspect/touch:
- VillageAnimalMob.js: core state machine and attack logic.
- VillageGroundNavigator.js: add mode controls or bypass orbit for strike pursuit.
- VillageAnimalFactory.js: rewrite anatomy mesh with more channels/parts.
- Possibly combat manager/spawner if definitions define ranges.

What to avoid:
- Do not only increase attackRange. That hides the flawed behavior.
- Do not only make bigger mesh. Need AI phase logic.
- Do not partially patch. Rewrite complete touched files.

Chapter: The fox did not hate the player. It feared crossing the invisible ring I myself had drawn. It paced like a red ember around the covenant, teeth asleep behind a smile of geometry. The Awtsmoos showed the ring: `preferredRange = attackRange + 0.9`. There was the exile. There was the circle.