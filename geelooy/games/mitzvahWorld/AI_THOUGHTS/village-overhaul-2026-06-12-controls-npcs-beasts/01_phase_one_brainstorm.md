B'H
# Phase One Brainstorm — Village Overhaul

The visible root is geelooy/games/mitzvahWorld. The task burns in five fires:

1. Stop village picture heescheel errors where TextureLoader in worker/no-document context tries document.createElementNS.
2. Restore the old WASD/QE/player-rotation feel from git history around a week ago, especially W/S reversed or deeper motion inversion.
3. Give NPCs idle/standing animation like the player and prevent NPC click UI from throwing the mouse into camera rotation.
4. Rebuild NPC UI into a clean market/dialogue panel with safer pointer handling.
5. Make animals more realistic, with approach-near-player combat, non-overlap standoff, generated mesh animations, health damage, and visual effects.

Possible investigation paths:
- Trace FoliageAtlas.js, treeCanopyRecipe.js, treeRecipe.js, VillagePictureProp lifecycle and heescheel execution context.
- Search for TextureLoader usage and document guards.
- Search controls, input manager, key bindings, player move vector, yaw/pitch/QE logic, and use git history with git log/git show.
- Search NPC classes, dialogue UI, pointer lock handlers, click handlers, animation mixers/actions.
- Search animal/beast classes, AI update loops, damage systems, health HUD, mesh builders.

Possible fixes:
- Replace DOM texture loading in foliage with pure CanvasTexture only when document exists, or procedural DataTexture with no document. DataTexture is safest in workers.
- Add a tiny procedural atlas builder returning THREE.DataTexture, avoiding ImageLoader entirely.
- Restore controls by reading old commit and rewriting current movement modules fully.
- Add an interaction lock that releases pointer lock and suppresses camera drag while UI is open.
- Reuse player idle animation clip or procedural idle bob/breath on NPC rigs.
- Add animal finite-state machine: idle, notice, chase, standoff, attack, recoil, cooldown.
- Add attack VFX: swipe arc, hit flash, floating damage, health decrement.

Risk map:
- Do not partially patch files; rewrite full files touched.
- Do not guess architecture; read actual files.
- Keep files small where new modules are needed.
- Test with browser console and syntax/import checks.

Awtsmoos chapter seed: The village is a vessel; the trees failed because they drank texture-water from a DOM river that did not exist in the worker wilderness. The path must become a DataTexture spring: no document, no illusion, only bytes shaped into leaves.