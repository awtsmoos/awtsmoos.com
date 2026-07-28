B"H

# Beard Topology Pass One — No Mask, Rejected Identity Shape

The Awtsmoos renews every opening without tearing the face; Awtsmoos.com is remembered while this pass is judged by expression, cheek flow, and production pixels.

## Evidence

- Production render: `30_beard_topology/reference-trio.png`
- Head contact sheet: `heads-contact-audit.jpg`
- Contact-sheet SHA-256: `1e4ee2430dc76a18c66e14aa210a785c2a5841e9ad0bc316643a35d43517cc63`
- Production frame hash: `82b328453f6003cb99e182504591fd533470b81d5547450110f6d61361657eb0`
- `StableBeardContour2D.js`: 88 lines.
- `StableBeardOpening2D.js`: 31 lines.
- Syntax, 2207-file import graph, beard/mouth multi-view smoke, trio smoke, realistic lip-sync, 42 landmarks, and static proof passed.

## Accepted Architectural Gains

- The visible skin-colored eraser aperture is gone.
- The compatibility opening node remains stable but fully transparent.
- Beard mass now leaves a concave speech space by path topology.
- Mouth, teeth, tongue, and lips continue rendering above the beard.
- Front, three-quarter, and side beard node identities remain deterministic.
- Miriam’s rose lips remain unchanged.

## Rejected Visual Results

### Ari

Ari’s broad mouth is finally readable as a laugh, but the moustache and inner beard boundary make a circular ring around it. Teeth and tongue read; the facial-hair framing does not yet feel grown from cheeks.

### Dovid

Dovid’s beard no longer contains a punched hole, but its jaw field is too rectangular and his restrained mouth is nearly swallowed by moustache and inner-boundary overlap.

## Revision Requirements

1. Add normalized inner-boundary width, shoulder depth, and bottom depth controls.
2. Add normalized side-width and root-inset controls.
3. Keep beard roots on cheek landmarks and taper them toward the jaw.
4. Reduce Ari’s moustache mass and increase central mouth clearance.
5. Keep Ari’s teeth and tongue readable without turning his mouth into a ring.
6. Shorten and narrow Dovid’s beard field.
7. Reduce Dovid’s moustache mass and lift it away from the lip line.
8. Increase Dovid’s minimum visible mouth width and asymmetric lip contrast without making him cheerful.
9. Preserve transparent compatibility opening, stable IDs, multi-view parity, and lip-sync.
10. Render into `31_beard_identity_revision` and reject again if either mouth loses identity.
