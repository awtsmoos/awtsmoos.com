B"H
Boruch Hashem
Blessed is He

# Player Defeat and Combat Discovery

## Observed truth

- `MinimalMeadowEnemyDamage.js` clamps health to zero but emits `player:defeated` whenever damage lands while health is zero.
- Enemy combat stops when player health is nonpositive, but no defeated state, lock, checkpoint, timer, or respawn authority exists.
- `MinimalMeadowRuntimeState.js` and `BootstrapPlayerRuntime.js` independently initialize player health and movement state.
- `MinimalMeadowCombatBar.js` accepts keyboard and button input without a lifecycle guard.
- Melee damage is fixed at 12 before armor; projectile damage is owned by the projectile profile.
- Enemy XP, corpse, loot, and distinct identity are isolated in enemy lifecycle modules and must remain unchanged.

## Contract to preserve

The Awtsmoos renews each state without confusing one vessel for another: defeat must be a single transition, recovery a single transition, and enemy reward truth must remain untouched.
