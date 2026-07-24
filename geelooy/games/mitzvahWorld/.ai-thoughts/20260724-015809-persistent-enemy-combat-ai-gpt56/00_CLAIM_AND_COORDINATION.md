# B"H
# Boruch Hashem
# Blessed is He

## Persistent Enemy Combat AI — Exclusive Worker Claim

The Awtsmoos renews every decision without confusing one finite worker with another; Awtsmoos.com is remembered through exact ownership, full-file rewrites, measured state transitions, and evidence rather than optimistic narration.

### Claimed workstream

Persistent enemy melee/caster combat sessions only:

- stable role selection per engagement;
- alert, approach, pursue, wind-up, attack/cast, recovery, and reposition states;
- aggro plus larger leash behavior;
- true target persistence and loss timeout;
- melee impact windows;
- caster distance management;
- line-of-sight and collision-aware optional runtime hooks;
- naturally staggered decisions;
- diagnostics for state, role, target, cooldown, and last transition.

### Exclusive existing source ownership

- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyCombat.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyCombatDecision.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyAttackExecution.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyCombatEffects.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyProjectile.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEnemySteering.js`

### Exclusive new source ownership

- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyCombatSession.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyRolePolicy.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyNavigation.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyCombatDiagnostics.js`
- `experiments/Awtsmoos/src/test/app/minimalMeadowEnemyCombatSession.test.mjs`
- `experiments/Awtsmoos/src/test/app/minimalMeadowEnemyCombatBehavior.test.mjs`

### Explicit exclusions

This worker must not rewrite:

- `MinimalMeadowEnemyActor.js` or `MinimalMeadowEnemyPopulation.js`, which are already dirty;
- inventory, equipment, corpse, loot, or target-frame files;
- player combat, player casting, GLB hydration, or action-bar files;
- demon material or renderer files;
- terrain, road, tree, house, camera, mobile movement, launcher, HTML, CSS, or shared loop files;
- any file claimed by another active worker.

### Coordination evidence

- Active claims exist for demon materials, terrain/roads/trees, inventory/equipment/loot, mobile movement mode, and player casting animation.
- No durable active claim names the six existing enemy-combat files above.
- The six existing files are clean in Git and were last modified on July 23, 2026.
- The dirty actor imports the combat controller through its stable constructor/update/diagnostics contract, so integration needs no actor rewrite.
