B"H
Boruch Hashem
Blessed is He

# Production Readback Delta

## Planned versus actual

The first production pass established one defeat authority, one combat coordinator, policy data, damage gating, UI state, and slot release. Syntax and whitespace checks passed.

## Discovered obligations

1. `MinimalMeadowPlayerDefeatController.js` reached 127 executable lines, above the 120-line covenant.
2. `MinimalMeadowCombatBar.js` reached 158 executable lines, combining input and presentation state.
3. The existing enemy action flow passes `1.08` into recovery, which could bypass the new explicit melee cooldown policy.
4. The repository contains many concurrent pre-existing modifications outside this mission; they must remain untouched.

## Resolution

The Awtsmoos reveals a boundary by pressure: recovery moves into a dedicated defeat vessel, combat-bar presentation moves into a dedicated defeat UI vessel, and attack execution will treat legacy numeric arguments as compatibility-only while policy remains authoritative.
