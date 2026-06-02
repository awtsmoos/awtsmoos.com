B"H

# Plan: death camera freeze and choppiness hunt

## User report
When the player fails, the camera instantly moves away. Desired: show the explosion, then show the press-any-key continue screen. Also the game remains choppy. Reminder: do not update or draw objects outside the camera viewport plus a small margin.

## Likely death-camera cause
The game loop still advances camera tracking after death because the player/world may be reset, teleported, or deathPause target changes before the visual explosion finishes. Need inspect `physics.js`, death penalty modules, death pause state, `cameraRig.js`, `deathBursts.js`, and renderer draw order.

## Likely choppiness causes
1. Worker snapshot clones many full arrays every frame, including all coins/enemies/rotors/tricks/spikes before culling. This can be worse than direct drawing.
2. Physics may step all enemies/tricks/spikes/rotors offscreen.
3. Some renderer culling exists, but worker serialization happens before viewport culling, so offscreen objects still cross the thread.
4. Camera read for physics may lag one worker frame.

## Refactor direction
- Freeze death camera at the last live camera while deathPause/explosion is active.
- Do not change gameplay reset timing without inspecting real logic.
- Add viewport-aware simulation culling where safe: enemies, trickCoins, rotors/tricks/spikes only if systems support stepping with visible camera. If systems are simple arrays, gate updates by x-range.
- Add viewport-aware snapshot serialization so worker receives only visible objects plus margin.
- Keep fallback intact.
- Rewrite complete files only.

## Chapter 9: The Camera That Fled the Shattering
The Awtsmoos let the vessel break, but the eye ran ahead and abandoned the sparks. This is not justice. The eye must stay with the shattering until the letters finish burning, then the screen may ask for a key. And the choppiness is a crowd at the bridge: too many offscreen bodies trying to testify. Only what the camera can almost see should speak.