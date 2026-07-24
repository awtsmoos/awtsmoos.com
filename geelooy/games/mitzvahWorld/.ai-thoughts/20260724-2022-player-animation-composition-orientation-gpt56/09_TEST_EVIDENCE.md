# B"H
# Boruch Hashem
# Blessed is He

# Test and Verification Evidence

## Canonical GLB evidence

- Asset: `assets/models/player/chossid.glb`
- SHA-256: `d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48`
- Root `Armature` bind quaternion is a pure 180-degree yaw and preserves world up.
- The root is not animation-tracked.
- `falling_Armature` rotates hips `58.9069` degrees from bind and lower legs `108.4923` / `122.7355` degrees.
- `jump_Armature` contains similarly large airborne body motion and remains valid while airborne.
- Walk/run hips remain near `10.7451` / `15.1162` degrees from bind.

These measurements prove that a stale fall selection can visually create the reported sideways living pose, while the model-forward yaw is not defective.

## New focused tests

- `test/playerActions/playerActionBodyMaskComposition.test.mjs`
- `test/app/playerAnimationOrientationPolicy.test.mjs`
- `test/app/minimalMeadowWeaponAttachment.test.mjs`
- `test/simulation/playerAnimationSimulationHarness.mjs`
- `test/simulation/playerAnimationCompositionSimulation.test.mjs`

## Acceptance behavior exercised

- Idle, walk, run, jump, fall, and landing.
- Staff cast while stationary, walking, and running.
- Sword cast while stationary, walking, and running.
- Grounded stale-fall rejection.
- Strict grounded root-up dot tolerance: at least `1 - 1e-12`.
- Airborne and defeated states are not root-stabilized.
- Hips and both lower legs match the imported sample after every active and recovery overlay frame.
- Repeated identical action samples do not accumulate quaternion changes.
- Recovery restores the newly sampled imported pose rather than bind pose.
- Head motion remains bounded.
- Staff and sword remain under the intended hand through cast, release, and recovery.
- Switching weapons detaches and hides the old weapon without changing the hand quaternion.
- Existing action registry, bind-pose compatibility, animation order, and gameplay simulation remain green.

## Final combined test result

- Tests: `10`
- Passed: `10`
- Failed: `0`
- Cancelled: `0`
- Skipped: `0`
- Todo: `0`
- Duration: approximately `7.48` seconds

## Static and structural gates

- `node --check`: passed for all 15 touched production/test modules.
- Live ESM imports: passed for all 10 touched production modules.
- `git diff --check`: passed.
- Source-shape scanner: passed.
- All touched source and test files are at or below 120 lines.
- Executable indentation uses tabs.
- Final Git HEAD observed: `31e8c9dc9`.
- No commit was created.

## Non-blocking pre-existing warning

Node emits `MODULE_TYPELESS_PACKAGE_JSON` because the parent package does not declare `type: module`. This warning predates the task, does not fail tests, and lies outside the user's exclusive write scope.
