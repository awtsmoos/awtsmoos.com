B'H
# Phase Two File Plan — After Inspection

Inspected real Android tunnel files:
- `ckidsAwtsmoos/Olam/uiManager/ui/joystick.js`: mobile controls hard-coded. Joystick bottom-left at 118px, jump bottom-right at 64px, action bar can overlap because no reserved bottom center lane or safe-area responsive CSS.
- `ckidsAwtsmoos/Olam/worker/input/TouchOrchestrator.js`: joystick up adds `KeyW`, down adds `KeyS`, left adds `KeyQ`, right adds `KeyE`. Since user says player moves opposite joystick face, invert mobile joystick mapping directly.
- `ckidsAwtsmoos/dvarim/nature/VillageGrassField.js`: imports library grass field.
- `libs/awtsmoos3d/foliage/grassField.js`: current grass uses TextureLoader atlas + MeshBasicMaterial. User wants custom shader one-time generated material.
- `VillageAnimalMob.js`: choppy approach likely from navigator move + distanceToPlayer + writeDebug + VFX/traversals.
- `VillageGroundNavigator.js`: each move probes ground and obstacle; close chase may raycast obstacle on every mob frame, though caches exist.

Actual file touch list:
1. `ckidsAwtsmoos/Olam/uiManager/ui/joystick.js`
   - Rewrite mobile CSS to separate zones: joystick left low, jump right low, action bar centered above controls, portrait safe-area variables.
2. `ckidsAwtsmoos/Olam/worker/input/TouchOrchestrator.js`
   - Rewrite desired mapping: up => KeyS, down => KeyW, left => KeyE, right => KeyQ. Keep thumb visual matching finger.
3. `libs/awtsmoos3d/foliage/grassField.js`
   - Rewrite to one shared `ShaderMaterial` / vertexColor shader, no TextureLoader; custom blade alpha/gradient/wind generated in shader.
4. `ckidsAwtsmoos/dvarim/nature/VillageGrassField.js`
   - Cache-bust library import and tune count/material names.
5. `VillageGroundNavigator.js`
   - Rewrite to support `mob.lowCostChase === true`, skip obstacle ray during close approach except every few frames, use law-only ground in tight close range, smooth velocity.
6. `VillageAnimalMob.js`
   - Rewrite/adjust to set `lowCostChase`, squared distance checks, no repeated `distanceToPlayer`, throttled debug, smooth movement state; less material traversal during approach.

20+ improvements to implement:
1. Responsive mobile controls with CSS variables.
2. Safe-area bottom support for Android/iOS browser bars.
3. Move action bar above bottom controls using broad `.actionBar/.action-bar` selectors.
4. Shrink action buttons in portrait.
5. Prevent jump button overlapping action bar.
6. Keep joystick thumb visual natural.
7. Invert mobile movement mapping only in TouchOrchestrator.
8. Diagnostic touch trace includes inverted seal.
9. Grass uses one shared shader material.
10. No TextureLoader for grass.
11. Per-instance tint preserved.
12. Vertex shader bends upper blade only.
13. Fragment shader uses procedural alpha blade shape.
14. Flowers use shared shader color mode.
15. Grass still skipRaycast/noOctree.
16. Navigator has law-ground fast path.
17. Obstacle probe throttled for close chase.
18. Mob uses squared distance.
19. Mob debug updates 4x per second max.
20. VFX pooling simplified/optional for close approach.
21. Approach smoothing with velocity vector avoids jitter.
22. Avoid closeEnough orbit during chase.
23. Maintain attack/windup/recover behavior.
24. Syntax check all.
25. Launch preview.

Awtsmoos chapter: The meadow no longer asks an image for grass; it sings grass in a shader. The fox no longer asks the octree every breath whether the air is a wall. The joystick no longer lies about north.