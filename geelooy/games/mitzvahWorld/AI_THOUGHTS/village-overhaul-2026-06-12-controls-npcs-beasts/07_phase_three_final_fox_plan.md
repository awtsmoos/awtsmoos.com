B'H
# Phase Three Final Fox Plan Before Rewrite

The correct fix is not to change one number. The animal needs a covenant of phases.

Actual final touch list:
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/combat/VillageAnimalFactory.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/combat/VillageAnimalMob.js`

Additional 30 refinements:
1. Factory returns a rig group with `userData.rigParts`.
2. Mob stores `this.rig = this.mesh.userData.rigParts`.
3. Factory still exports `createVillageAnimal` and `disposeVillageAnimal` only, preserving imports.
4. No external assets needed.
5. Use low-poly but anatomical proportions.
6. Fox body length along local Z remains clear.
7. Set group rotation only once; avoid double-facing confusion.
8. Mob `faceToward` should point local forward correctly.
9. Navigator currently sets mesh.rotation.y = atan2(direction.x,direction.z)+PI. Keep factory local forward compatible with that.
10. State machine should use seconds consistently.
11. `readyToAttack()` checks cooldown and distance.
12. Chase target stop distance should be `strikeRange * 0.72`, not preferredRange.
13. Windup starts when within `windupRange`.
14. Strike has a lunge vector that can briefly close distance.
15. Damage moment occurs once per strike.
16. Player position re-evaluated at damage moment.
17. No overlap: after strike, recover/backoff runs.
18. Use `recoverUntil` and `stateUntil` as seconds.
19. VFX: hit arc mesh, warning ring mesh, maybe emissive flash.
20. Remove VFX after timeout.
21. Fallback damage: if `takeDamage` absent, mutate `currentStats.health` and emit HUD.
22. Debug: userData.animalState, distance, attackReady.
23. Patrol still works outside aggro.
24. If player is dead/missing, back to patrol.
25. Keep death/reward behavior unchanged.
26. Avoid setTimeout for logic where possible; use state time and one damage gate.
27. Use Math.min dt to prevent leaps.
28. Animal mesh scale should be based on base scale, not cumulative multiply.
29. Health bar or name label child should not wildly scale? Existing label may be separate; keep whole scale mild.
30. After write, run syntax and read back.

Final revelation: the fox must stop circling because the code will stop asking it to hold `preferredRange` outside attackRange. The old code created a ritual dance without a strike. The new code creates pursuit, warning, hit, recovery. The Awtsmoos flows through order, and order here means state.