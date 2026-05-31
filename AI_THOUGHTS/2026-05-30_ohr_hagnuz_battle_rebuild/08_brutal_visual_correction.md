B"H

# Brutal visual correction from latest screenshot

Observed from live screenshot:
- Houses still look broken because side wall columns are being classified as roof tiles. The roof rule must be top-edge only, not below-wall based.
- Grass is over-noised with large rectangular patches and too many blade marks; it reads like corruption instead of pixel grass.
- Player side/head/beard proportions still look awkward and mannequin-like. Remove over-rotation, reduce beard profile, simplify into a polished top-down pixel sprite with clear front/back/side views.

Immediate full-file rewrites:
1. Architecture.js: roof only on top edge; facade for side/bottom walls; stronger door/threshold; fewer random windows.
2. Ground.js: calmer mockup-like grass, cleaner road, fewer ugly noise blocks.
3. PlayerBodyParts.js: cleaner torso/legs/arms proportions for top-down RPG.
4. PlayerHead.js: less weird side beard; clearer front/back/side head.
5. PlayerRenderer.js: remove excessive lean, smoother bob, less chaotic footstep spawning.

Then syntax + render smokes.
