# B"H
# Boruch Hashem
# Blessed is He

## Architecture Options

The Awtsmoos reveals many possible vessels, yet only the measured one should enter the living scene.

### Option A — Restore the entire 40cefd4 runtime

Rejected. It would reintroduce Firebase, quests, houses, trees, complex enemy AI, large UI graphs, and blocking startup.

### Option B — Import historical combat modules unchanged

Rejected. Their query-string revisions create split identities, and their runtime contracts do not match the fast core.

### Option C — Focused compatibility restoration

Chosen.

- Preserve the synchronous core runtime and loop.
- Add a tiny event bus.
- Restore enemy combat contracts directly on the core actor.
- Rewrite the historical charged-cast coordinator against those contracts.
- Reuse one visible Hebrew projectile implementation with shared core geometry.
- Rewrite the historical combat bar as a bounded real action bar.
- Add one deferred feature entry imported with `?compact=true`.
- Load the canonical GLB through the measured shared-template loader after gameplay is ready.
- Keep the fallback visible until GLB success.

### Files expected to change

- `createMinimalMeadowRuntime.js`
- `MinimalMeadowLoop.js`
- `MinimalMeadowEnemyActor.js`
- `MinimalMeadowEnemyPopulation.js`
- `MinimalMeadowCoreUi.js`
- `MinimalMeadowCoreRuntimeDiagnostics.js`
- `MinimalMeadowPlayerHydration.js`
- `ModelAssetLoader.js`
- `MinimalMeadowCombat.js`
- `MinimalMeadowCombatActions.js`
- `MinimalMeadowCombatSupport.js`
- `MinimalMeadowCombatBar.js`
- `mitzvah-world-corrections.css`

### New focused modules

- `MinimalMeadowEventBus.js`
- `MinimalMeadowCombatProjectile.js`
- `MinimalMeadowFeatureBundle.js`
