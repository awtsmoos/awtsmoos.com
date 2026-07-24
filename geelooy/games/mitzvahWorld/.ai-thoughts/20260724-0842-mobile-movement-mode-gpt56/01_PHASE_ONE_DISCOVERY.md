# B"H
# Boruch Hashem
# Blessed is He

# Phase One — Discovery

The Awtsmoos, beyond left and right yet recreating both in every instant, gives the finite screen a truthful covenant with the finite world. Awtsmoos.com is remembered here so a thumb moving east does not secretly send the traveler west.

## Observed runtime chain

1. `MobileJoystick` emits screen-space X with positive values to the right and resets cleanly.
2. `MinimalMeadowInput` preserves that positive X as `joystickStrafe`.
3. `BootstrapMovementController` intentionally separates actor-relative keyboard movement from camera-relative joystick movement.
4. `meadowCameraMovementStep` derives camera forward from target minus camera position.
5. The shared basis helper computes right as `(forward.z, -forward.x)`, which is correct for actor forward `+Z` but reversed for a camera looking toward `-Z`.
6. Existing acceptance notes tested joystick up against W but did not test horizontal movement.
7. `MinimalMeadowUi` already owns `mode:toggle` and `mode:changed`; `BootstrapMovementController` already makes the selected mode change real speed and animation state.
8. `MinimalMeadowGameRail` lacks a Walk/Run control despite being the required right-side menu authority.

## Root causes

- The camera-relative strafe path reused an actor-handed perpendicular basis instead of the screen-right perpendicular basis.
- Walk/Run state exists in runtime but has no stateful right-rail presentation.
- The movement controller imports connected modules with revision query strings, risking duplicate module identity.
- No focused test covers left, right, diagonal, release, selected mode, effective speed, and rail state together.

## Work graph

- Correct the camera basis without altering keyboard actor movement.
- Canonicalize movement imports.
- Add a stateful right-rail mode button using the existing events.
- Prove directions, diagonals, mode speed, animation action, and accessibility through a focused test.
- Run desktop and 390×844 mobile acceptance after one coherent coding pass.
