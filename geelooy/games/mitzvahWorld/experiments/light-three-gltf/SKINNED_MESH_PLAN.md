B"H

# Tiny Awtsmoos GLTF Skinned Mesh Plan

This isolated experiment now contains a true custom GLTF runtime for `chossid.glb`, without THREE and without importing GLTFLoader.

## Completed runtime foundations

- Built every glTF node once, then attached children, mirroring GLTFLoader's dependency/cache idea.
- Resolved skin joints through the global node map.
- Read inverse bind matrices.
- Calculated joint palettes as `inverse(meshWorld) * jointWorld * inverseBindMatrix`.
- Uploaded `JOINTS_0` and `WEIGHTS_0` to WebGL.
- Supported normalized accessors, sparse accessors, strided accessors, `UNSIGNED_BYTE` joints, and weight normalization.
- Used float joint textures for the 65-joint Armature when available.
- Parsed and played all animation clips with translation, rotation, scale, LINEAR/STEP, and quaternion slerp.

## Second pass from mobile visual feedback

The user confirmed the model and walking animation are visible, but the model was too dark. This pass added:

- reusable `tiny-orbit-controls.js`,
- reusable `tiny-animation-buttons.js`,
- split `tiny-viewer-hud.js`,
- split `tiny-chossid-app.js`,
- thinner `chossid-tiny-viewer.html`,
- brighter CSS radial background,
- transparent WebGL canvas,
- shader normal attributes,
- skinned normal transform,
- ambient/key/fill/rim lighting,
- a small black-cloth lift so coat/hat detail is not crushed into pure silhouette,
- instant animation clip buttons below the dropdown.

## Still intentionally tiny / not yet full GLTFLoader

The tiny runtime still does not attempt the full loader surface:

- no texture image sampling yet,
- no PBR metal/rough BRDF,
- no morph target playback,
- no camera/light nodes from glTF,
- no KHR extension stack beyond what this model needs.

Those are now explicit future modules, not accidental omissions.

## Pass conditions

PASS requires:

- full body visible with coat, arms, legs, head/hat/beard/face in place,
- animation clips selectable instantly,
- orbit controls usable by touch/mouse,
- no exploded coat,
- no THREE or GLTFLoader resource loaded,
- shader/program errors surfaced in HUD,
- syntax checks pass for every experiment JS file.
