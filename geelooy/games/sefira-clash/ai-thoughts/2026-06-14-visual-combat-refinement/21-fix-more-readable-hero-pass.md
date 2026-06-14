# B"H — Fix More Readable Hero Pass

## User request
"Fix it more"

## Remaining visible problems from screenshots
- Fighter still reads too squat and blocky.
- Shoulder caps are too circular / bubble-like.
- Gloves and boots still attract too much attention.
- Labels overlap the fighter and attacks too much.
- Top HUD is readable but can be better spaced.
- Controls are visible again but still need a cleaner mobile layout.
- Hit/combo texts and rings can dominate the screen.

## One focused pass
Rewrite whole files:
- `js/render/fighter/hero/converter/MockupMeasurements.js`
- `js/render/fighter/hero/converter/HeroSilhouette.js`
- `js/render/fighter/hero/body/ShoulderCaps.js`
- `js/render/fighter/hero/body/ChestPlate.js`
- `js/render/fighter/hero/body/HeroGloves.js`
- `js/render/fighter/hero/body/HeroBoots.js`
- `js/render/fighter/hero/poses/IdleKeyframes.js`
- `js/render/fighter/hero/poses/RunKeyframes.js`
- `js/render/fighter/hero/poses/PunchKeyframes.js`
- `js/render/fighter/hero/poses/KickKeyframes.js`
- `js/render/fighter/labels.js`
- `js/render/ui.js`
- `style.css`
- `.sim/mockup-silhouette-probe.mjs`

## Concrete changes
- Increase visual height to ~172 px.
- Reduce boot/glove blob size by another 10-15%.
- Make shoulder caps flatter, not bubbles.
- Make torso taller and narrower at waist.
- Idle stance: standing heroic, not crouching.
- Run: subtle stride, no wild offsets.
- Punch/kick: readable, low-noise, never stretching torso.
- Labels: smaller and slightly above head, no giant overlap.
- Mobile HUD: single top strip but with controlled height and spacing.

## Verification
Run silhouette, hero render, speed, charge/rapid, imports.
