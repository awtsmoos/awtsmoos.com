B"H

# Crown and Headwear Pass One — Rejected Visual Audit

The Awtsmoos renews every failed curve into evidence for the next revelation; Awtsmoos.com is remembered while this pass is judged by pixels rather than by green tests.

## Evidence

- Production render: `20_crown_headwear/reference-trio.png`
- Direct head crops: `ari-head.png`, `dovid-head.png`, `miriam-head.png`
- Disposable inspection contact sheet: `heads-contact-tiny.jpg`
- Contact-sheet SHA-256: `2277a1e373d29dc6803433190438da1d627a00234a612db81d22e5f6dd97fe21`
- Static-frame hash changed from baseline `2c927244...6419` to pass-one `abe81255...f2b1`.
- Syntax, import graph, trio smoke, landmark proof, and static proof all passed.

## Accepted Gains

- Ari and Dovid now expose substantially more forehead than the baseline.
- Male crown hair no longer reads as one uninterrupted low helmet across the brow.
- Kippah contact is no longer mathematically floating above the crown.
- Miriam’s fringe has a real part concept and separate root, mass, and part nodes.
- The protected twelve-field path transform remains untouched.
- `faceShellBox` remains independent and skin-only.

## Rejected Visual Results

### Male Hairlines

The irregular hairline rhythm is too large and too symmetric. At production crop scale it reads as three broad triangular teeth instead of small character-specific locks. The outer crown is smoother, but the front edge still looks generated rather than grown.

### Kippahs

Both kippahs now contact the crown, yet their domes are too shallow. In the real crop they collapse into thin black slivers instead of visible crown-resting caps. Ari needs a broad dome; Dovid needs a smaller but still legible dome.

### Miriam

The fringe sweep runs in the wrong visual direction relative to the reference. Its closing contour falls through the center of the face, producing a heavy vertical slab. The wrap baseline is too low and the rear shell too deep, so the wrap still reads as a helmet rather than cloth following the upper skull.

## Architectural Cause

- Kippahs are rendered after front hair inside `StableAccessories2D`, so their lack of height is geometry, not occlusion.
- Miriam’s fringe is rendered in `StableHair2D.overlay` after the head wrap, so its central slab is entirely the fringe path.
- The existing fringe API lacks a semantic sweep direction.
- The wrap preset leaves the front baseline around `0.48` head radii above center and the rear shell down to `0.74` below center, producing excessive vertical coverage.

## Required Revision

1. Replace broad male zigzags with shallow irregular lock rhythm controlled by normalized depth and bias.
2. Increase kippah dome rise and width while keeping a bowed crown-contact edge.
3. Add reusable `sweepDirection`, `partOffset`, `sweepReach`, `tipReach`, and thickness controls to the fringe API.
4. Reverse Miriam’s main sweep toward viewer-left and keep the opposite root small.
5. Raise the wrap baseline, reduce rear depth, tighten shell width, and keep the bun behind the ear line.
6. Render to a new `21_crown_headwear_revision` directory and reject again if the silhouettes remain synthetic.
