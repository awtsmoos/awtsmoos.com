B'H
# Phase Three Final Brainstorm
The most realistic mobile-safe architecture:

A. Solid body mesh per animal root:
- Merge torso, chest, hips, neck, head, snout into one BufferGeometry.
- Keep legs/tail/ears/eyes separate because they need animation and visibility.
- Body mesh uses one fur material with generated CanvasTexture.

B. Texture system:
- FurGenerator supports species, base colors, directional hair fibers, stripes/spots, belly masks, muzzle mask.
- TextureForge stores awtsmoostex://foxfur, rabbitfur, deerfur, goatfur, birdfeather.
- For immediate sync rendering, AnimalBodyForge can create CanvasTexture directly and still mark desired forge type.

C. Realism priorities:
- Fox: long body, pointed snout, tall ears, bushy tail with white tip, black socks, amber eyes, chest patch.
- Rabbit: compact body, large hind legs, long ears, soft mottled fur, small tail, hopping gait.
- Deer: long legs, slender neck, spots, alert head, tail flag.
- Goat: sturdy body, horns, beard, coarse fur, climbing behavior.
- Bird: flapping wings, feather bands, flock height.

D. Performance:
- One body mesh + maybe 10-16 child parts per animal is acceptable because animal counts are modest.
- Use shared generated textures/materials per species.
- Use simple geometries transformed/merged, not heavy imports.

E. Verification:
- node --check new files.
- grep for wildlife root userData targetable.
- Make sure CombatTargeting still finds wildlifeActor root.
