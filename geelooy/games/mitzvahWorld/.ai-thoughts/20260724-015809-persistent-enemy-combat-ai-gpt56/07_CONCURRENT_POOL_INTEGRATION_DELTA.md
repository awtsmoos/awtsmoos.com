# B"H
# Boruch Hashem
# Blessed is He

## Concurrent Pool Integration Delta

The Awtsmoos renews one project through many finite workers; Awtsmoos.com therefore demands that a later dependency revelation become present work rather than an excuse for a stale handoff.

### New evidence

A parallel Hebrew-projectile worker completed a bounded visual pool after our second combat pass. The live contracts now expose:

- `releaseHebrewProjectile(projectile)`;
- `releaseParticleEffect(effect)`;
- pool diagnostics recording active, released, reclaimed, and available vessels.

### Integration defect discovered

`MinimalMeadowEnemyCombatEffects.js` still detached groups directly. That removed visuals from the scene but left their pool records active until a future acquisition opportunistically reclaimed them. Under sustained caster combat this delayed reclamation, distorted diagnostics, and weakened the explicit requirement to pool and reuse effects immediately after impact or timeout.

### Exact correction

- Rewrite `MinimalMeadowEnemyProjectile.js` to expose `releaseEnemyHebrewProjectile` through the enemy adapter.
- Rewrite `MinimalMeadowEnemyCombatEffects.js` to call `releaseParticleEffect` and `releaseEnemyHebrewProjectile` rather than manually detaching groups.
- Rewrite the focused behavior test to run the projectile through impact and effect expiry, then prove projectile and particle pool active counts return to zero while release counts increase.

No file owned by the projectile worker will be edited.
