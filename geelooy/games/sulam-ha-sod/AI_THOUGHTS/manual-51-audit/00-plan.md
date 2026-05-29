B"H
# Manual 51-Level Finalization Plan

## Oath
No generated replacement levels. No blanket generator rewrite. Every level remains an authored chamber. Any edit must be a complete rewrite of the affected file, based on reading it first.

## Scope
- js/data/levels.js registry
- all js/data/levels/level*.js files, including split submodules
- final-seven factory because 45-51 depend on it
- enrichment pipeline because it mutates every level after import
- physics, camera, spike, trick, trigger systems enough to judge possibility

## Passes
1. Enumerate all registry imports and file ownership.
2. Read every level file in manageable batches.
3. Import enriched LEVELS and compute concrete geometry.
4. Validate chain count, door/exit, keys, coins, hazards, one-way/trick platform behavior, reset/death conditions.
5. Classify route hops using real constants: SPEED=280, JUMP=-680, GRAVITY=1700, player 34x48.
6. Flag only real failures, then fix handmade files one by one.
7. Rerun tests and a manual ledger generator.

## Human threshold
The audit must not rely on graph magic. Mandatory route must have readable platforms, no hidden leap, no required fake/trick route unless visibly taught, and no unavoidable spike corridor.
