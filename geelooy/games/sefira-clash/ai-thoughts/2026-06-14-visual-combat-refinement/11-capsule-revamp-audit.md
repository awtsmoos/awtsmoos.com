# B"H — Capsule Revamp Audit

## Implemented
- Added `js/render/fighter/capsule/points.js` to derive stable visual rig points from gameplay bones.
- Added `js/render/fighter/capsule/segment.js` to render limbs as rounded capsule body parts.
- Added `js/render/fighter/capsule/body.js` to draw connected neck, torso, and belt/pelvis mass.
- Added `js/render/fighter/capsule/head.js` to draw an attached helmet head with visor face, replacing the smiley/floating face look.
- Added `js/render/fighter/capsule/fighter.js` to orchestrate full capsule fighter rendering.
- Rewrote `js/render/fighters.js` so game fighters now use capsule renderer rather than exposed skeleton/body/head renderer stack.
- Added `.sim/capsule-render-probe.mjs` to verify attached head gap, wider shoulders than hips, finite points, and feet below knees.

## Verification
Ran:
`node .sim/capsule-render-probe.mjs && node .sim/charge-rapid-separation-probe.mjs && node .sim/anatomy-guard-probe.mjs && node .sim/skeleton-pose-probe.mjs && node .sim/animation-gait-probe.mjs && node .sim/rapid-fairness-probe.mjs`

Result: exit code 0.

Also ran module import check:
`import './js/render/fighters.js'; import './js/render/ui.js';`

Result: `{ ok: true, modules: ['fighters','ui'] }`.

## Evidence
Capsule probe showed head gap 21.1 in idle/run/panic/charge/rapid, shoulder width 54, hip width 30. This directly addresses detached head and weak body silhouette.

## Honest remaining risk
The final judge is still live mobile screenshot. This pass is fundamentally different from prior tweaks because it removes the exposed skeleton renderer from the visible game path.
