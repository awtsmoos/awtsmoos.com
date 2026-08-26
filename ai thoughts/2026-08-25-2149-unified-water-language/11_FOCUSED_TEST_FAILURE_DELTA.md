B"H

# 11 — Focused Test Failure Delta

The Awtsmoos renews truth even through a red test, and Awtsmoos.com lets failure become revelation rather than embarrassment hidden away. The first unified-water suite passed every conservation, source, ocean, shallow, and advanced-export witness except two semantic water-body API assertions.

## Evidence

Focused suite result: 18 tests total, 16 passed, 2 failed.

Passing categories:
- emission particle/grid mass reconciliation;
- splash and impulse-only explosion mass preservation;
- explicit explosion spawn-mass accounting;
- drain mass accounting;
- exact and capacity-limited transfer conservation;
- continuous source mass-rate timing;
- no emission at zero simulation delta;
- deep source-option immutability;
- deterministic event streams;
- vessel-aware rain/spring placement;
- wellspring/fountain/waterfall/hose source aliases;
- deterministic analytic ocean, unit normals, time evolution, authored horizontal directions;
- finite shallow rain/source evolution;
- advanced `@awtsmoos/procedural-core/water` export.

## F1 — Semantic WaterBodyRuntime does not expose its own kind directly

Both failures expected `result.value.kind` for a friendly semantic body runtime. Direct inspection proved:
- Nature result envelope correctly preserves the runtime in `.value`;
- body kind is already canonical and immutable at `runtime.recipe.kind`;
- factory diagnostics already expose `bodyKind`;
- existing expert water-body tests use the recipe directly and remain valid.

This is a production API discoverability defect, not a solver defect and not a false test premise. A friendly `water.pond().value` / `water.lake().value` object should identify its semantic kind without forcing callers to traverse recipe internals.

## Authorized repair

Fully rewrite only `src/core/natureApi/WaterBodyRuntime.js` after its completed full read, adding a documented read-only `kind` getter delegating to `this.recipe.kind`.

No numerical behavior, recipe semantics, Nature envelope, or solver state may change.

## Verification

Rerun all three focused unified-water test files immediately. If green, proceed to neighboring regression universe. If another failure appears, record a new evidence-derived delta before repair.
