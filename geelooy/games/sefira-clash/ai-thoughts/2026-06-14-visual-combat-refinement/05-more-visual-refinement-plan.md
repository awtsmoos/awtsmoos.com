# B"H — Further Visual Refinement Plan

## Why continue
The user asked if we are sure. We are not fully sure until live browser evidence. We therefore improve the visible renderer further while preserving the IK root fix.

## New files inspected
- `js/render/fighters.js`: renderer order is body, limbs, hands/feet, clothes, head, labels.
- `js/render/fighter/head/head.js`: head uses raw bone tip plus lean.
- `js/render/fighter/head/drawFace.js`: face is one flat circle.
- `js/render/fighter/limbs/drawHandsFeet.js`: hands/feet are raw ovals at tips, not oriented to limb direction.

## Visual improvements to write
- Add richer head shape with jaw/face highlight so fighters look less like lollipops.
- Orient hands/feet based on their parent bone angle, so feet look planted instead of round dots.
- Add body anatomy guard overlay not as debug but as subtle readable pelvis/shoulder relation in torso.
- Keep each file small and rewrite whole files only.

## Files to rewrite whole
- `js/render/fighter/head/drawFace.js`
- `js/render/fighter/limbs/drawHandsFeet.js`
- `js/render/fighter/body/drawHips.js`

## Verification
Run syntax and animation probes again.
