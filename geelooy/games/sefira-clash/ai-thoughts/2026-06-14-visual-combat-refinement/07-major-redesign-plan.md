# B"H — Major Redesign Plan After Fresh Screenshots

## New user evidence
Fresh localhost screenshots show the previous fixes were insufficient:
- Fighters still read as triangular squat skeletons.
- Torso/chest mass is too narrow compared with pelvis/legs.
- Mobile HUD overlaps controls and hides fighters.
- Charge stacks during rapid tapping, which is wrong.

## Root changes needed now
1. Charge must only accrue from deliberate held punch/kick, not rapid taps.
2. Fighter silhouette must stop being pure stick figure. Add a readable chest/shoulder/abdomen silhouette under skeleton lines.
3. Mobile HUD must leave space for touch controls and compress bot cards/offscreen beacons.

## Files to rewrite whole
- `js/combat/attackState.js`: reset charge on release, require hold before armed charge, ignore rapid inputs for charge glow.
- `js/combat/startAttack.js`: tick charge after intent edge read, and don't let rapid override use stored charge.
- `js/render/fighter/body/body.js`: draw body as silhouette under limbs.
- `js/render/fighter/body/drawTorso.js`: make shoulders/chest wide and pelvis visually smaller.
- `js/render/ui.js`: mobile HUD redesign with top compact cards and safe offscreen beacon stacking.
- `style.css`: mobile touch controls smaller and lower safe layout.

## Verification
Run charge-specific node probe, anatomy guard, combat probes, and syntax checks.
