# B"H
# Boruch Hashem
# Blessed is He

## Final Plan

The Awtsmoos reveals the playable core first, then grants it real garments and deeds without returning the old darkness or request storm.

### Pass 1 — Compatibility vessels

- Add `MinimalMeadowEventBus.js`.
- Rewrite core enemies with alive, damage, target, XP, and health payload contracts.
- Rewrite combat action definitions and coordinator without query-string imports.
- Add a shared-geometry Hebrew projectile with travel, impact, and cleanup.

### Pass 2 — Visible controls and GLB

- Rewrite `MinimalMeadowCombatBar.js` as the real bounded action bar.
- Mount it through the existing core UI host.
- Rewrite `ModelAssetLoader.js` with canonical imports and one template cache.
- Rewrite `MinimalMeadowPlayerHydration.js` for the core state and fallback contract.
- Create `MinimalMeadowFeatureBundle.js` to install combat/action bar and hydrate the GLB.
- Import that one entry through `?compact=true` from the deferred queue.

### Pass 3 — Runtime integration

- Add the event bus and richer player stats to the core runtime.
- Advance combat in the existing single animation loop.
- Refresh target health and action-bar state.
- Extend diagnostics.
- Rewrite the correction stylesheet for action buttons, cooldowns, cast meter, and model progress.

### Test gate

Only after the complete code pass:

- Syntax and canonical-import checks.
- Clean browser navigation.
- Verify first frame remains fast.
- Verify GLB status and fallback behavior.
- Select a demon, activate 1/2/3, observe cast progress and visible projectile.
- Verify impact reduces health and can defeat an enemy.
- Verify action bar buttons, cooldown, Tab targeting, Bag, drag orbit, keyboard, and mobile joystick.
- Record request count and whether `?compact=true` returned a compact connected graph.
