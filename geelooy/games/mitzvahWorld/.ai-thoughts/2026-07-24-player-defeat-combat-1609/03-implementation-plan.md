B"H
Boruch Hashem
Blessed is He

# Production Implementation Plan

1. Add `MinimalMeadowPlayerDefeatPolicy.js` for delays, health, and lock policy.
2. Add `MinimalMeadowPlayerDefeatState.js` for checkpoint and lifecycle state.
3. Add `MinimalMeadowPlayerDefeatController.js` for defeat, cancellation, animation request, timer, and exactly-once respawn.
4. Add `MinimalMeadowCombatBalancePolicy.js` for explicit encounter values.
5. Add `MinimalMeadowCombatBalanceCoordinator.js` for shared attack slots and player invulnerability frames.
6. Rewrite both runtime initializers to install authoritative lifecycle and combat-balance state.
7. Rewrite enemy decision, execution, effects, damage, and combat modules to consume policy and arbitration.
8. Rewrite combat bar to lock input and show finite defeat/recovery state.
9. Preserve enemy lifecycle, XP, loot, quest, and enemy identity behavior.
10. After production readback, add gameplay and deterministic simulation tests.
