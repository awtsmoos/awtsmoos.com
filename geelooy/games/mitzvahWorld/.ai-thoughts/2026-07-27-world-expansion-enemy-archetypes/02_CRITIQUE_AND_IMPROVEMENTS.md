B"H

# Second Pass: Critique and Improvements

## Problems with a naive implementation

Simply appending three profiles would create recolored copies because the present role system collapses temperament into only melee or caster. Simply enlarging terrain would reduce grid quality from roughly 3.06 units per cell to 5 units per cell if steps stayed at 72. Simply moving enemies outward could place patrol points too near the new boundary. Uniform body scaling would fail to communicate enemy type.

## Improvements

1. Add an explicit archetype policy module rather than embedding conditionals in combat files.
2. Give every archetype one stable role, range multipliers, damage scale, cooldown scale, orbit scale, projectile speed scale, and silhouette scale.
3. Keep all modifiers bounded so the combat-mercy policy remains authoritative.
4. Preserve the one-attacker-slot system.
5. Never let profile damage exceed global policy damage.
6. Keep the warden slower and safer despite its health.
7. Keep the skirmisher quick but low-damage and fragile.
8. Keep the cantor distant but with slow readable projectiles and long recovery.
9. Add archetype identity to diagnostics and payloads.
10. Use nonuniform body scale to make types readable at a distance.
11. Expand terrain from 220 to 360.
12. Raise terrain steps from 72 to 120 so grid spacing improves slightly.
13. Keep texture density source-driven, allowing exact repeat count to grow automatically.
14. Preserve central village, houses, river, lake, and existing enemies.
15. Place new enemies between radius 122 and 148.
16. Add a world-bounds policy with safe spawn radius 162.
17. Validate every patrol waypoint against safe bounds.
18. Increase outer hill structure so the larger world does not become empty flat repetition.
19. Add three outer hills and one low saddle to terrain shape.
20. Keep roads and landmark geometry central rather than stretching them artificially.
21. Add one dedicated test per new archetype.
22. Each test must verify role, silhouette, movement, combat modifiers, and safe spawn.
23. Add one expansion test for size, steps, cell width, and nine unique profiles.
24. Update old six-enemy wording and count assertions only where current.
25. Preserve all files below 120 lines by splitting profile data, archetype policy, and world bounds.
26. Run current combat, terrain, targeting, readiness, and whole-world tests.
27. Verify a live browser reports terrain size 360 and nine actors.
28. Confirm no console or network errors.
29. Do not move the player spawn into the new encounter ring.
30. Do not commit or push.

## Risk graph

`terrain size -> grid step count -> collider density -> load time`

`enemy archetype -> role/ranges/cadence -> action flow -> damage safety`

`spawn radius -> patrol radius -> safe inset -> terrain bounds`

`body scale -> target hints -> pointer selection -> visual readability`

## Chosen files

- new `MinimalMeadowWorldBounds.js`
- new `MinimalMeadowEnemyArchetypePolicy.js`
- new `MinimalMeadowEnemyProfileFactory.js`
- rewrite `MinimalMeadowEnemyProfiles.js`
- rewrite `MinimalMeadowEnemyRolePolicy.js`
- rewrite `MinimalMeadowEnemyCombatDecision.js`
- rewrite `MinimalMeadowEnemyAttackExecution.js`
- rewrite `MinimalMeadowEnemySteering.js`
- rewrite `MinimalMeadowEnemyActor.js`
- rewrite `MinimalMeadowEnemyPopulation.js`
- rewrite `MinimalMeadowTerrainData.js`
- rewrite `MinimalMeadowTerrainShape.js`
- add three focused enemy tests and one world expansion test
