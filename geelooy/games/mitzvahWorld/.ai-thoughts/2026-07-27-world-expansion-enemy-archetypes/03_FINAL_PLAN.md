B"H

# Final Plan

## Production architecture

### World contract

Create `MinimalMeadowWorldBounds.js` with:

- size 360
- half size 180
- safe encounter radius 162
- grid steps 120
- cell width 3
- helpers for spawn safety and clamping

Rewrite terrain data to consume that contract. Rewrite terrain shape to add outer hills at distances 105–155 while keeping the central village unchanged.

### Enemy archetype contract

Create `MinimalMeadowEnemyArchetypePolicy.js` with immutable bounded definitions:

- `warden`: melee, 0.78 aggro scale, 1.35 cooldown scale, 0.9 damage scale, 0.8 movement scale, 0.72 orbit scale, broad silhouette
- `skirmisher`: melee, 1.08 aggro scale, 1.08 cooldown scale, 0.62 damage scale, 1.25 movement scale, 1.55 orbit scale, narrow silhouette
- `cantor`: caster, 0.95 aggro scale, 1.42 cooldown scale, 0.72 damage scale, 0.86 projectile speed scale, 1.28 caster range scale, tall silhouette

The global mercy balance remains the ceiling. Archetype damage can only reduce it.

### Profile data

Create `MinimalMeadowEnemyProfileFactory.js` so the profile list remains declarative and under 120 lines. Rewrite `MinimalMeadowEnemyProfiles.js` with the six existing enemies plus:

- `even-koved` / Even Koved / warden / northwest outer rim
- `ratz-layla` / Ratz Layla / skirmisher / southeast outer meadow
- `baal-otiyot` / Baal Otiyot / cantor / northeast outer ridge

Each profile receives unique tint, health, armor, speed, loot, body scale, patrol radius, biome, and archetype.

### Runtime integration

- Role policy reads archetype role first.
- Combat ranges apply bounded archetype range multipliers.
- Attack execution applies bounded damage and cooldown scales.
- Projectile launch applies speed scale.
- Steering applies archetype orbit scale.
- Actor applies nonuniform body scale.
- Population wording and diagnostics report nine enemies and archetype counts.
- Payloads and receipts include archetype and biome.

## Tests

Add exactly three dedicated enemy type test files:

1. `enemyWardenArchetype.test.mjs`
2. `enemySkirmisherArchetype.test.mjs`
3. `enemyCantorArchetype.test.mjs`

Add one world expansion contract test:

4. `minimalMeadowWorldExpansion.test.mjs`

Each enemy test verifies its actual profile, stable role, bounded modifiers, silhouette, safe spawn, and a behavior-specific property.

## Verification

1. Syntax and 120-line ceilings.
2. Four new tests.
3. Current enemy combat, selection, terrain, readiness, and world tests.
4. Full Node world simulation.
5. Live browser check for world size 360, nine actors, three new archetypes, and zero runtime/network errors.
6. Diff check and path-scoped status.

No commit or push.
