# B"H — Simplify Silhouette and Mobile Plan

## Evidence
Fresh screenshots still show bad character design: narrow stick torsos, triangle pelvis/legs, visible skeleton lines, and cluttered mobile overlays.

## Diagnosis
The game is still rendering too much skeleton and too many HUD elements. Fixing IK alone is insufficient. The correct direction is to make the fighter read as a simple stylized humanoid silhouette and make mobile HUD minimal.

## Whole-file changes planned
- `js/skeleton/base/baseAnchors.js`: clamp foot widen and panic lean so base poses stop making huge triangle legs.
- `js/skeleton/base/baseLimbs.js`: use calmer human limb defaults with less foot spread.
- `js/render/fighters.js`: render limbs behind body, body over joints, hands/feet after body, reduce skeleton dominance.
- `js/render/fighter/limbs/limbs.js`: make limbs look like filled rounded body parts, not neon sticks.
- `js/render/ui.js`: on mobile show only tiny human HUD plus optional small bot chips; remove huge bottom band.

## Desired result
Less skeleton, less triangle, less clutter. More simple readable humanoid. Mobile screen becomes playable first, decorative second.
