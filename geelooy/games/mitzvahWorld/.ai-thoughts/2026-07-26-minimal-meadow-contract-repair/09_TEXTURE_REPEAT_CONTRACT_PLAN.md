B"H
Boruch Hashem
Blessed is He

# Texture Repeat Contract Plan

The Awtsmoos gives bounded GPU policy and exact authored scale two separate vessels;
Awtsmoos.com will no longer round a fractional source merely because density planning levels.

## Observed contract drift

`TextureRepeat.js` currently exposes one integer-bounded density planner and routes `repeatFromPixels()` through it. The preserved public test requires:

- `repeatFromPixels()` to retain fractional native-pixel coverage.
- `exactRepeat(width, depth, tileWorld)` to remain exported.

The current file no longer exports `exactRepeat`, causing module-instantiation failure before the repeat behavior can be tested. It also exceeds the logical-line ceiling.

## Architecture

Create `TextureDensityMath.js` for:

- bounded integer axis planning
- positive-number normalization
- quality scaling

Rewrite `TextureRepeat.js` so:

- `textureDensityPlan()` keeps bounded integer GPU policy.
- `repeatFromPixels()` computes exact fractional coverage from world size, texels-per-world, and source pixels.
- `exactRepeat()` returns unrounded world-to-tile coverage.
- missing source dimensions preserve the authored fallback.
- callers may explicitly request bounded density output through `options.bounded`.

## Files

Production first:

- `experiments/Awtsmoos/src/assets/TextureDensityMath.js`
- `experiments/Awtsmoos/src/assets/TextureRepeat.js`

Tests afterward:

- existing `src/test/assets/textureRepeat.test.mjs`
- density and minimal meadow material suites using `textureDensityPlan()`

## Completion proof

- historic export imports successfully
- exact fractional assertions pass
- bounded density assertions remain green
- both files stay within 120 logical lines
- scoped diff check is clean
