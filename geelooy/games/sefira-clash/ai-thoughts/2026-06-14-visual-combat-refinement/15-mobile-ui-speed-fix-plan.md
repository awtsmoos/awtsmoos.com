# B"H — Mobile UI and Animation Speed Fix Plan

## New screenshot diagnosis
The current mobile screen still has too much interface weight:
- Browser bar plus game topbar consume huge vertical space.
- Percentages are at the bottom and collide visually with controls.
- Action buttons are too large and too visually heavy.
- Joystick is too prominent.
- Offscreen beacons stack around the sides and add clutter.
- Animations still feel too fast even after previous timing constants.

## One-pass fix
- Move all damage/percent display to top canvas HUD.
- Hide the game topbar entirely on mobile with CSS, since browser already consumes top space.
- Move mobile HUD safe area to top but below browser/notch using canvas top safe value.
- Make bottom controls smaller, lower opacity, and tucked to the corners.
- Reduce offscreen beacon size and opacity further.
- Slow visual timing constants again: idle/run/attack/hit.
- Reduce visual run stride deltas so animation no longer jitters.

## Files to rewrite whole
- `js/render/ui.js`
- `style.css`
- `js/render/fighter/capsule/limbBounds.js`
- `js/render/fighter/capsule/locomotion.js`
- `js/render/fighter/capsule/attackPoses.js`
- `.sim/visual-animation-speed-probe.mjs`

## Verification
Run UI imports, visual speed, capsule quality, and prior probes.
