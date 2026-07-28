B"H

# Phase One — Unbounded Brainstorm

The Awtsmoos creates the point, the tangent, the garment, and the gaze; through Awtsmoos.com the many paths may reveal one living cast instead of three assembled machines.

## Ideal Character System

Imagine a normalized character grammar rather than a drawing recipe. A morphology profile would describe stature, mass distribution, shoulder descent, ribcage breadth, pelvis width, spine arc, limb ratios, stance, asymmetry, and cloth allowance. A skeleton would expose semantic joints, while every visible limb would be generated from tangent-safe exterior contours whose overlaps conceal the mechanism.

The character API could separate:

- Identity: skull, face plane, eye family, nose family, mouth scale, ear placement, hairline, beard architecture.
- Morphology: height, build, shoulder slope, torso taper, limb proportions, posture, stance, asymmetry.
- Wardrobe: garment block, ease, weight, hem behavior, collar, lapel, cuff, placket, pocket, overlap, compression.
- Performance: view, gaze, blink, lids, brows, cheeks, jaw, phoneme, emotion, coarticulation, breathing.
- Staging: world transform, depth, contact shadow, pose, gesture, line tiers, palette.

## Organic Geometry Possibilities

- Skull envelopes generated from forehead, temple, cheek, jaw, and chin arcs instead of a single oval.
- Hairline paths driven by forehead exposure, recession, peak count, irregularity, sideburn descent, and view bias.
- Kippah paths derived from sampled crown normals, contact span, dome lift, brim flattening, and perspective skew.
- Wraps derived from skull offset bands with controlled seam, temple cover, rear knot/bun occlusion, and fabric weight.
- Beards generated as cheek-rooted outer fields with side taper, jaw-following lower contour, chin mass, moustache bridge, and expression-aware mouth clearance.
- Mouths generated as expression contours with lip-sync deformation layered inside an identity envelope.
- Eyes generated from upper/lower lid splines with independent hooding, aperture, canthus tilt, pupil ellipse, sclera exposure, squint, and blink.
- Garments generated from body fields plus ease, seam anchors, gravity, compression zones, and arm-pose intersections.
- Hands generated from palm hull, thumb wedge, finger fans, knuckle rhythm, cuff overlap, and gesture semantics.
- Shoes generated from ankle contact, toe box, sole plane, stance angle, and character-specific scale.

## Reference Trio Possibilities

### Ari

Ari should read before detail as a generous round mass opening toward the audience. His jacket should be one soft navy architecture around a white central shirt, not a torso plus attached sleeves. His left arm should widen from the shoulder, compress at the elbow, open into a fan-shaped palm, and return behind the cuff. His right fist should sit warmly against the chest with thumb and knuckle rhythm. His head should expose a generous forehead beneath irregular crown hair. A broad kippah should settle into that crown. His beard should grow from cheek roots and frame a broad laugh whose teeth and tongue are visible without becoming a mechanical slot.

### Dovid

Dovid should read as a compact, guarded taper. His shoulders descend toward crossed forearms rather than spiking. One sleeve should pass clearly above the other, with cuffs and hand fragments explaining the lock. His eyes should be hooded and side-looking, his brows unequal, his crown hair visible, and his small kippah seated precisely. His beard should be short and cheek-following. His skeptical mouth should be small, asymmetric, visible, and emotionally legible even at full-body scale.

### Miriam

Miriam should read as a narrow grounded vertical with a soft oval head, weighted skirt, and separated flats. Her wrap should hug the skull. Her fringe should sweep from a real side part across the forehead and tuck into the wrap while leaving a rear bun visible. Her leftward gaze must remain obvious. Her olive overshirt should have shaped fronts, collar, cuff, hem, and a believable pocket opening. One hand should disappear naturally into that pocket; the other sleeve should fall smoothly to a relaxed reusable hand. Her rose lip contour must remain delicate under every speech state.

## Movie-Maker Possibilities

- A deterministic time evaluator shared by preview, save/reload, static proof, and export.
- Semantic tracks for transform, pose, gaze, blink, brows, mouth, emotion, visibility, garment variants, and camera.
- Stable clip and keyframe IDs with selection, trim, duplication, copy/paste, and undo/redo commands.
- A responsive workspace with canvas priority, collapsible assets/inspector, track headers, transport, and touch-friendly mobile timeline.
- Design tokens for spacing, typography, elevation, color roles, focus rings, line tiers, and interaction states.
- A proof harness that exports frame hashes, decoded frame comparisons, bounds, alpha occupancy, landmark audits, and screenshots for desktop/mobile interactions.

## Five Competing Architectural Directions

### A. Preset-Only Tuning

Keep existing geometry and tune the trio presets. Fast, but likely to hardcode defects and fail reusability.

### B. Universal Shape Grammar

Introduce normalized generators for headwear, beard, mouth, garments, hands, and shoes, then express the trio as presets. Highest reuse and best fit to the request; moderate integration cost.

### C. Full Constraint Solver

Model cloth, anatomy, and overlap as constraints solved at runtime. Powerful but excessive for current production needs and risky for determinism.

### D. Authored Path Templates with Morph Targets

Create high-quality normalized template paths and interpolate semantic control points. Strong visual control, but risks becoming identity-specific unless carefully generalized.

### E. Hybrid Grammar plus Authored Profiles

Use reusable geometry families with normalized authored profile data, semantic anchors, and deterministic deformation. This balances quality, identity, editability, and serialization.

## Phase-One Choice

Direction E is the strongest vessel: normalized reusable grammar for structure, authored profile data for identity, and deterministic deformation for performance. The first implementation family should focus on crown hair, kippah/wrap/fringe/bun, beard roots/opening, and expression-first mouths because these failures dominate identity and can be isolated before garment work.
