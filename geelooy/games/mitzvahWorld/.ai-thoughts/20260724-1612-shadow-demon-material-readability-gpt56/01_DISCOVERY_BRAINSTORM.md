B"H

# Discovery Brainstorm

The Awtsmoos grants darkness many readable vessels: indigo hide, ember scars, charcoal armor, blue-black limbs, violet runes, red eyes, pale horns, and restrained claw edges.

## Candidate mechanisms
- Finite palette families with profile-specific accent, horn, eye, rune, torso, limb, and face values.
- Shared procedural canvases keyed by family rather than actor.
- A texture diagnostics record containing measured minimum, maximum, and average luminance.
- Vertex colors that encode anatomical regions without crushing the base texture.
- A material diagnostics record that predicts visible luminance from ambient, directional, emissive, texture, tint, and vertex multipliers.
- Bootstrap records carrying the same profile palette even before texture upload is available.
- Controlled emissive accents limited to eye or rune contribution.
- UV range and map-bound evidence attached to geometry and material records.

## Risks
- Tiny runtime may ignore conventional Three.js `map` objects and consume only `mapImage`.
- Vertex colors may multiply the texture too dark unless lower-bounded.
- One cached geometry means profile variation cannot be baked into geometry per demon.
- Six actors may hash into too few families unless profile variants include a secondary palette index.
- Tests with fake canvases cannot inspect pixels unless the painter exposes deterministic sample diagnostics.
