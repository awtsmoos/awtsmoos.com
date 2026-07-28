B"H

# Crown and Headwear Pass Three — Improved but Rejected

The Awtsmoos renews each judged silhouette before pride may call it complete; Awtsmoos.com is remembered while the renderer, the crop, and the reference remain the court of evidence.

## Evidence

- Production render: `22_crown_headwear_revision/reference-trio.png`
- Head inspection sheet: `heads-contact-tiny.jpg`
- Inspection SHA-256: `30ff4da3187ba46aed9162659d3a7d7d39cbdfb02730d3ee73af18c06ee25b68`
- Production frame hash: `4a828d96fe3bfb8b58949823254de7d6d4736ab7bec879a3b54485602d5abc7e`
- All seven files are between 58 and 91 lines.
- Every touched JavaScript file passed `node --check`.
- Import graph: `2207` files, `0` misses.
- Trio smoke, 42-landmark proof, and 1536×864 static proof passed.

## Accepted Gains

- Male kippahs now sit near the crown apex instead of hovering, collapsing into slivers, or swallowing the entire hair mass.
- Ari and Dovid retain visible brown crown around their black headwear.
- The male center hairline no longer forms large triangular teeth.
- Miriam’s fringe is constrained above the eye plane.
- Miriam’s tighter wrap and visible rear bun remain improved.
- The protected twelve-field path transform and skin-only `faceShellBox` remain intact.

## Rejected Visual Results

### Male Front Hair

The front hairline node still travels over the crown apex and closes along the forehead edge. It therefore remains a second filled crown layered over the back crown. At production scale this produces a thick brown horizontal band across both foreheads rather than a narrow grown edge revealing skin.

### Miriam Fringe

The eye-plane intrusion is solved, but the fringe still divides into two pointed masses. The reference requires one broad leftward sweep from a viewer-right part, with only a quiet tucked counter-root. The current root and main mass compete equally and produce a split pointed silhouette.

## Fourth-Pass Requirements

1. Convert `StableMaleHairline2D` from a filled crown into a narrow curved foreground ribbon whose upper and lower edges follow the same temple-to-center growth arc.
2. Leave `StableHairCrown2D` solely responsible for the rear crown mass.
3. Preserve the `natural_male_hairline` node ID while changing its normalized geometry responsibility.
4. Keep current kippah placement unless the new ribbon exposes a contact conflict.
5. Reduce Miriam’s counter-root to a small tuck at the part.
6. Make the main fringe one broad crescent sweeping viewer-left, with a rounded tip above the brow and a return contour near the part.
7. Preserve the tighter wrap and bun.
8. Render into `23_crown_headwear_revision` and compare directly against all prior passes and the artistic reference.
