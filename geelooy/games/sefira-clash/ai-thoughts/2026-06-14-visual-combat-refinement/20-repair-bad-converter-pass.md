# B"H — Repair Bad Converter Pass

## User report
The new converter pass made gameplay worse:
- animations barely work
- weird pixelated mess during hits
- UI is too small and not usable
- body is squat / awkward

## Diagnosis
The converter values were too squat and the pose targets over-constrained the fighter into a crouched blob. The effects stack is still drawing old hit/impact/charge layers over the new hero shape, creating visual clutter. Mobile controls were faded/shrunk too aggressively and top HUD is too small.

## Repair pass files
Rewrite whole files:
- `js/render/fighter/hero/converter/MockupMeasurements.js`
- `js/render/fighter/hero/converter/HeroSilhouette.js`
- `js/render/fighter/hero/poses/IdleKeyframes.js`
- `js/render/fighter/hero/poses/RunKeyframes.js`
- `js/render/fighter/hero/poses/PunchKeyframes.js`
- `js/render/fighter/hero/poses/KickKeyframes.js`
- `js/render/fighter/hero/poses/StunKeyframes.js`
- `js/render/fighter/hero/effects.js`
- `js/render/fighters.js`
- `js/render/ui.js`
- `style.css`
- probes if thresholds no longer match the better visual target

## Concrete fixes
- Tall fighter: raise head/torso, longer legs, less squat stance.
- Hands at readable height, not hanging below knees.
- Feet not oversized blobs; still readable but narrower.
- Attack poses become restrained, not broken stretched shapes.
- Hit visual effects: remove old noisy front/back effects from hero pass and use clean aura only.
- Mobile UI: top strip larger; controls visible enough and larger.
- Side arrows less visible.

## Verification
- mockup silhouette probe
- hero render probe
- material probe
- imports
- existing combat probes
