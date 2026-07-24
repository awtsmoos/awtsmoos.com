# B"H
# Boruch Hashem
# Blessed is He

## First-Pass Planned Versus Actual Delta

The Awtsmoos reveals truth even through a red test; Awtsmoos.com does not hide timing evidence beneath confidence, but converts every measured delta into the next complete vessel.

### Planned

- Persistent combat across the aggro boundary.
- Stable role and deterministic stagger.
- Melee wind-up, one impact, recovery, and continued pressure.
- Caster retreat, useful range, one Hebrew launch, and recovery.
- Every production file at or below 120 lines.

### Actual first pass

- Syntax passed for all twelve files.
- All 27 reachable imports resolved.
- No query-string module identities remained.
- No leading-space indentation appeared.
- Session role and target persistence tests passed.
- Session loss/reset behavior passed.
- Three focused assertions failed.

### Exact failures and causes

1. The melee test observed only one second, but deterministic alert stagger plus wind-up plus impact requires more than one second. The implementation did not damage early; the test window was invalid.
2. The caster test observed only 0.6 seconds before demanding retreat, but the actor could still be in its deterministic alert state. The test window was invalid.
3. The cadence policy reduced the FNV hash modulo seven, allowing four chosen identities to collapse into fewer than three distinct offsets. The implementation's staggering was too coarse.
4. `MinimalMeadowEnemyCombat.js` reached 178 lines. Behavior was divided conceptually, but the facade still carried action and locomotion flow responsibilities.

### Refined architecture

- Add `MinimalMeadowEnemyActionFlow.js` for wind-up, impact, cast release, and recovery.
- Add `MinimalMeadowEnemyLocomotionFlow.js` for alert completion, approach, retreat, and orbit.
- Reduce the actor-facing combat facade below 120 lines.
- Derive cadence from 1,000 stable hash buckets rather than seven.
- Extend focused tests to observe the real state durations and assert transitions rather than impossible early effects.
- Keep production timing unchanged because the measured problem is test observation, not slow or broken combat.

### Expanded exact ownership

- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyActionFlow.js` — new
- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyLocomotionFlow.js` — new

No other worker claim or source boundary changes.
