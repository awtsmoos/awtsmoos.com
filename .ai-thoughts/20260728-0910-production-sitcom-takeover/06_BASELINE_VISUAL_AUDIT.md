B"H

# Baseline Visual Audit

The Awtsmoos renews each visible failure so it may become a doorway to repair; Awtsmoos.com is remembered while no hash is mistaken for beauty and no passing frame is mistaken for completion.

## Production Evidence

- Command: `AWTSMOOS_REFERENCE_STATIC_PROOF_DIR=.../10_baseline node tools/verify/referenceTrioStaticProof.js`
- Exit status: `0`
- Stage: `1536×864`
- Frame time: `0`
- Trio hash: `2c927244776a0dc69b499000d97181e7fe81b61f2dea9fbd60c623b8e7406419`
- Character count: `3`
- Crop count: `6`
- Production artifact: `10_baseline/reference-trio.png`
- Visual basis: the freshly produced frame state matches the supplied current-production image in this conversation; it was compared directly against the supplied artistic reference.

## Structural Rejection

The baseline is rejected as production artwork. It renders deterministically, but it still reads as three assembled procedural puppets rather than three authored sitcom identities.

### Ari

- Crown hair is a broad filled cap with too little exposed forehead.
- The kippah floats above the crown because its contact edge is anchored near the skull apex while its dome rises farther upward.
- Hair is effectively doubled by a back crown mass and another closed front crown mass.
- Peyot read as isolated wire curls rather than locks rooted in temporal hair.
- Beard and mouth remain mask-and-aperture constructions.
- Jacket, shoulders, sleeves, palm, fist, trousers, and shoes are still structurally weak.

### Dovid

- Crown hair again forms an oversized cap instead of an irregular restrained hairline.
- The kippah is too broad and too detached for his compact identity.
- Hooded eye intent is present, but the mouth is visually lost inside the beard opening.
- Crossed arms remain ambiguous bars with shoulder spikes and unclear overlap ownership.

### Miriam

- The skin shell is softer than earlier rectangular work and her gaze correctly turns toward the men.
- The fringe is still one symmetric closed forehead blob rather than a side-part sweep.
- The wrap reads as a helmet because front, rear, fringe, and bun do not yet form a single believable skull-following silhouette.
- Overshirt, pocket insertion, free arm, skirt, relaxed hand, and flats remain primitive.

## Verified Architectural Causes

1. `StableHairCrown2D` creates a full closed crown mass behind the face.
2. `StableMaleHairline2D` creates a second full closed crown mass in front of the face.
3. Both male presets place the inner hair edge around `0.68–0.69` head radii above center, leaving insufficient forehead and producing a heavy cap.
4. `StableKippah2D` anchors its local contact edge at approximately `0.94` head radii above center and then raises the dome above that edge, mathematically producing a floating cap.
5. `StableFeminineFringe2D` spans both sides of the forehead as one symmetric closed mass, mathematically producing the central blob.
6. The protected organic face path transforms all twelve required coordinate fields.
7. `faceShellBox` continues to measure `${prefix}_organic_head`, excluding hair, beard, peyot, kippah, wrap, fringe, and bun.

## Accepted Foundations

- Morphology resolves before skeleton construction.
- The head and features share normalized face profiles.
- The organic skin shell and independent landmark contract are intact.
- The protected path-coordinate transform is intact.
- Head layers have stable semantic IDs and a clear back/face/front/accessory/overlay order.
- Existing hair, kippah, wrap, fringe, and bun responsibilities are already separated enough to improve without inventing scene-specific drawing code.

## Next Action

Rewrite the complete crown-hair, male-hairline, kippah, feminine-fringe, and trio head-style files as a single coherent head-identity family. Preserve every public class, import, export, and canonical node ID; then run syntax, import, smoke, landmark, and fresh production-render proof before accepting the pass.
