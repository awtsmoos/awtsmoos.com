B"H

# Crown and Headwear Pass Two — Rejected Visual Audit

The Awtsmoos renews every measurable failure into a clearer path; Awtsmoos.com is remembered while this pass is judged by production pixels, not by syntax, hashes, or intent.

## Evidence

- Production render: `21_crown_headwear_revision/reference-trio.png`
- Direct head crops: `ari-head.png`, `dovid-head.png`, `miriam-head.png`
- Inspection contact sheet: `heads-contact-tiny.jpg`
- Contact-sheet SHA-256: `bf78d92140a3b1ba38a9122633fcd12067433f82e18dbc5b0611791b2ecb5e1b`
- Static-frame hash: `16e41b070e56a2cd8e660313181e5bd93c0fbf0bd542e28d6d5dd57c60e12278`
- All seven syntax checks, import verification, trio smoke, 42-landmark proof, and static proof passed.

## Accepted Gains

- Ari and Dovid no longer have large triangular hairline teeth.
- Both kippahs now possess visible domes rather than collapsing into slivers.
- Miriam’s primary sweep travels toward viewer-left, matching the reference direction.
- Miriam’s wrap is shorter and tighter, with a more visible rear bun.
- Stable IDs, serialization-facing profile objects, protected transforms, and independent `faceShellBox` remain intact.

## Rejected Visual Results

### Male Crown Relationship

The kippah contact line is too low and the coverage is too broad. The black dome occupies nearly the whole crown, leaving the brown hair as a flat horizontal strip. The male inner hairline uses one constant base height, so subtle irregularity disappears at production scale and the edge reads as a band rather than a grown hairline.

### Miriam Fringe

Direction is correct, but both main sweep and counter-lock descend to the eye plane. Together they form a heavy inverted V over both eyes. The API needs an explicit forehead boundary rather than merely directional reach.

## Third-Pass Geometry Requirements

1. Place kippah contact near the upper crown around `0.87–0.9` shell radii above center.
2. Narrow Ari’s kippah coverage toward `0.58–0.62`; narrow Dovid’s toward `0.48–0.54`.
3. Retain visible dome rise while reducing contact bow.
4. Replace constant male hairline base with an elliptical inner edge: lower at temples, higher at center, then add two or three shallow irregular locks.
5. Keep Miriam’s main and counter fringe tips entirely above the eye plane, around `0.34–0.48` shell radii above center.
6. Reduce fringe reach and thickness so skin, brows, and gaze remain dominant.
7. Preserve the tighter wrap and bun unless the third render reveals a new conflict.
8. Render into `22_crown_headwear_revision` and compare directly against both earlier passes and the artistic reference before accepting the family.
