# B"H
# Boruch Hashem
# Blessed is He

# Browser Acceptance Evidence

The Awtsmoos recreates thumb, camera, traveler, speed, label, focus, and hit target in one present covenant; Awtsmoos.com records measured evidence rather than confidence.

## Production-module harness

A same-origin browser harness imported the real repository modules:

- `BootstrapMovementController`
- `MinimalMeadowGameRail`
- `MobileJoystick`
- `AwtsmoosEventBus`

The harness did not replace their contracts with test-only implementations. It supplied only the minimal runtime collaborators those production modules normally receive from the game. Artifacts live outside Git under:

`/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/20260724-mobile-movement-mode`

## Desktop — 1280×800

- Walk distance over one second: `4.2` world units.
- Run distance over one second: `7.2` world units.
- Actions changed from `walk` to `run`.
- Selected mode became `run`.
- Right-rail label became `Run`.
- `aria-pressed` became `true`.
- Mode target measured `57.390625 × 44` CSS pixels.
- The representative center point hit the mode button.

## Mobile — 390×844

- Right joystick vector X: `+0.7435412728418399`; world X: `+1.3383742911153118`.
- Left joystick vector X: `-0.7435412728418399`; world X: `-1.3383742911153118`.
- Forward joystick Y: `-0.7435412728418399`; world Z: `-1.3383742911153118`.
- Backward joystick Y: `+0.7435412728418399`; world Z: `+1.3383742911153118`.
- Diagonal normalized to `0.7071067811865476` per axis and moved to `(+1.2727922061357855, -1.2727922061357855)`.
- Release reset magnitude, X, and Y to exactly zero.
- Mode target measured `57.390625 × 44` CSS pixels and remained hittable.
- Secondary right-rail actions collapsed while the Walk/Run button remained visible and interactive.
- Runtime mode remained `run`; no Shift override was active.

## Result

All twelve acceptance assertions passed. Browser console errors and warnings captured by the harness: `0`. Harness resource count: `8`.

## Combined-page blocker

The full combined game page was also attempted from the clean worker server. It requested `126` resources and then stopped before publishing `AwtsmoosMitzvahWorldBoot` or the runtime, with an unhandled promise rejection in the concurrently changing integration graph. The movement modules did not appear in the final failed request tail. This worker did not modify another worker's active integration files to conceal that blocker. The integration worker must rerun the complete game after all claims are merged.
