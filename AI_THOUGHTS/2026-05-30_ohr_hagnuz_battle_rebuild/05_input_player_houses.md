B"H

# Immediate corrections from live screenshot

The battle click/tap failure has a concrete code cause: Input.debateIndex calls moveIndexAt with numeric arguments, but moveIndexAt expects a full battle layout object. This makes the card hit test false/broken on mobile.

Next full-file rewrites:
1. Input.js: bind pointer to game shell, convert coordinates against the canvas, pass battleMoveLayout(canvas.width, canvas.height) into moveIndexAt, and keep overworld pathing correct.
2. PlayerHead.js + Human.js: make people less mannequin/gray, more polished pixel character like the mockup: clear face, hair/kippah, controlled beard, shadow, proportions.
3. Architecture.js: make house tiles more coherent: roof shingles, facade stone, door glow, windows only in sensible positions.
4. HudRenderer.js: move the bottom toast above controls so it no longer collides with the joystick/action buttons.

No partial patches. Rewrite complete files only.
