# B"H — Cut Everything Step Plan

## User command
"Start cutting everything step by step."

## Meaning
Stop preserving old clutter. Cut the remaining UI weight, cut the old semi-stick capsule proportions, and move toward the mockup in deliberate passes.

## Step 1 — Cut mobile UI clutter
Files:
- `style.css`
- `js/render/ui.js`

Actions:
- Hide the game topbar on mobile permanently.
- Make bottom controls ghost-like until touched.
- Move damage to a compact top strip only.
- Stop drawing bot percent pills at bottom.
- Make offscreen arrows tiny and less opaque.

## Step 2 — Cut old body proportions
Files:
- `js/render/fighter/capsule/limbBounds.js`
- `js/render/fighter/capsule/points.js`
- `js/render/fighter/capsule/body.js`
- `js/render/fighter/capsule/head.js`

Actions:
- Bigger helmet.
- Stronger neck.
- Wide chest/shoulders.
- Narrow waist.
- Less raw gameplay-bone influence.

## Step 3 — Cut procedural flailing
Files:
- `js/render/fighter/capsule/authoredPoses.js` new
- `js/render/fighter/capsule/poseMixer.js` new
- `js/render/fighter/capsule/points.js`

Actions:
- Define authored idle/run/jump/punch/kick/stun silhouettes.
- Use gameplay bones only as hints, not as visible truth.

## Step 4 — Cut animation speed
Files:
- `js/render/fighter/capsule/limbBounds.js`
- `js/render/fighter/capsule/locomotion.js`
- `js/render/fighter/capsule/attackPoses.js`

Actions:
- Slow visual cycles and reduce jitter deltas.

## Step 5 — Verify each cut
Commands:
- `node .sim/visual-animation-speed-probe.mjs`
- `node .sim/capsule-quality-probe.mjs`
- `node .sim/capsule-render-probe.mjs`
- `node .sim/charge-rapid-separation-probe.mjs`
- `node .sim/rapid-fairness-probe.mjs`
