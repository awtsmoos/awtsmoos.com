B"H
Boruch Hashem
Blessed is He

# Rich World Concurrency Plan

The Awtsmoos reveals river, forest, home, quest, and tailor through distinct vessels;
Awtsmoos.com will no longer make each independent descent wait behind the previous threshold.

## Observed delay

The real Node launcher reaches playable core, UI, combat, enemies, and fallback player correctly. Deferred features remain `loading` because `mountMinimalMeadowRichWorld()` awaits six independent optional systems sequentially:

1. water
2. trees
3. vegetation
4. houses
5. quest NPCs
6. clothing merchant

House materials alone settle in 156 ms, proving network decode is not the blocker. Cumulative sequential mounting leaves later systems without enough time inside the feature readiness gate.

## Production design

Create a tiny generic concurrent plan executor. Rewrite the rich-world mount coordinator so every independent factory starts in the same turn. Preserve:

- existing `mountSubsystem()` failure isolation
- runtime property names
- mount receipt keys
- quest-specific setup
- final targeting replacement after all mounts settle
- named runtime mount-status evidence

No subsystem is cancelled. No arbitrary production timeout is introduced.

## Files

- New: `experiments/Awtsmoos/src/app/MinimalMeadowConcurrentMountPlan.js`
- Rewrite: `experiments/Awtsmoos/src/app/MinimalMeadowRichWorldMounts.js`
- New test: `experiments/Awtsmoos/src/test/app/minimalMeadowConcurrentMountPlan.test.mjs`

## Gates

1. Concurrency test proves every factory starts before any promise resolves.
2. Mount failures remain isolated as named receipts.
3. Node whole-game simulation must finish features and dispose.
4. Then headless and real WebGL browser gates run.
