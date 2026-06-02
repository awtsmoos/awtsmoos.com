B"H

# Done: Smooth Top-Down Upgrade

## Files rewritten completely

- `geelooy/games/ohr-hagnuz/src/atzmus/HolyEngine.js`
- `geelooy/games/ohr-hagnuz/src/yesod/Logic.js`
- `geelooy/games/ohr-hagnuz/src/yesod/Input.js`
- `geelooy/games/ohr-hagnuz/src/tiferet/Projector.js`
- `geelooy/games/ohr-hagnuz/src/tiferet/projector/Camera.js`
- `geelooy/games/ohr-hagnuz/src/tiferet/projector/CanvasScaler.js`
- `geelooy/games/ohr-hagnuz/src/tiferet/render/PlayerRenderer.js`
- `geelooy/games/ohr-hagnuz/src/tiferet/render/player/FootstepParticle.js`

## Files added

- `geelooy/games/ohr-hagnuz/src/yesod/motion/MotionConfig.js`
- `geelooy/games/ohr-hagnuz/src/yesod/motion/HeroMotion.js`

## What changed

- Movement now uses delta time rather than raw frame increments.
- One tile now takes about 430ms and samples around 26 frames at 60fps.
- Hero motion uses smoothed start/landing and snaps cleanly to final tile at arrival.
- Camera follow is frame-rate independent with half-life smoothing and snap protection.
- Canvas resizing is centralized to avoid resizing storms.
- Pointer clicks now use the same visible camera as rendering.
- Footstep particles are now world-space and draw relative to camera.
- Player renderer no longer spawns screen-space particles, reducing visual mismatch.

## Verification

1. Motion smoke test passed:
   - one tile produced 26 frames
   - hero snapped to target tile
   - camera followed smoothly
   - delta clamp passed

2. Import graph smoke test passed for 9 main modules:
   - index
   - HolyEngine
   - Logic
   - Input
   - Projector
   - Camera
   - CanvasScaler
   - PlayerRenderer
   - FootstepParticle

3. File size check passed:
   - all rewritten/added files are under 150 lines except none; Projector is 135 lines and Logic is 110.

## Limitation

`simulateRuntime` first failed because entry lookup used the wrong relative root. A second full-path attempt returned too much output through the tunnel transport, so browser simulation was not relied on. Node behavioral and import tests passed.

Chapter 12: Gevurah looked back and saw the same village, but not the same world. The path had stopped biting the hero’s feet. The river no longer flickered like a wounded blade. Each frame descended like a measured letter of speech, a finite glyph receiving endless renewal. Then came the twist: the choppiness had never been in the hero. It had been in the eye that followed him. Once the eye learned humility, the whole world became smooth.
