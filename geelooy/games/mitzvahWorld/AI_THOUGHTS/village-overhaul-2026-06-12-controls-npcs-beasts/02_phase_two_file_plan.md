B'H
# Phase Two File Plan

Actual inspected files so far:
- ckidsAwtsmoos/dvarim/nature/villagePicture/FoliageAtlas.js: confirmed TextureLoader.load(ROOT+file), which triggers document.createElementNS and dies in no-document heescheel context.
- ckidsAwtsmoos/chayim/chossid/methods/controls.js: current controls map W/S/Q/E/A/D, but current file lost the old showingImportantMessage early-return from git 5929467f6.
- ckidsAwtsmoos/chayim/chai/methods/physics/index.js: current movementDirection resembles git 5929467f6 but adds camera FPS yaw; old law says player.rotation.y is root. If W/S feels reversed, the direct physical vector may need a body-facing correction rather than key remap.
- ckidsAwtsmoos/dvarim/npc/InteractiveNpc.js: NPC already tries standing pose, but heesHawvoos is empty; animation mixer never updates, so idle action freezes.

Files to actually touch first pass:
1. FoliageAtlas.js — full rewrite, no TextureLoader, use procedural THREE.DataTexture atlas. This directly kills document-not-defined.
2. InteractiveNpc.js — full rewrite with same public payload, plus animationMixer update in heesHawvoos and pointer/UI guard calls before opening menu.
3. controls.js — full rewrite preserving current code plus showingImportantMessage guard and UI/pointer suppression helper.

Potential later files after more tracing:
- Olam interaction Peula/camera input if NPC click still rotates after the NPC guard.
- animal/beast files once located.
- physics/index.js only if live control test proves W/S vector still inverted.

20 improvements over phase one:
1. Prefer DataTexture over CanvasTexture to work in worker and main thread.
2. Preserve atlas UV cell layout exactly: 4 columns x 2 rows.
3. Give procedural leaves transparent alpha so alphaTest still works.
4. Cache procedural textures per requested file name.
5. Keep material API unchanged.
6. Avoid new image assets.
7. Add userData marker proving no DOM texture loader.
8. Restore showingImportantMessage movement pause.
9. Avoid key remap unless physics confirms true inversion.
10. Make NPC UI open set olam.showingImportantMessage true.
11. Release browser pointer lock if present.
12. Set short click suppress timestamp to prevent camera drag in same frame.
13. Stop propagation/preventDefault on pointer events when possible.
14. Keep explicitTap contract so proximity hover does not open UI.
15. Update animation mixer every frame on NPC.
16. Refresh standing pose if action was stopped.
17. Keep real GLB and fallback visual behavior unchanged.
18. Test syntax through node import/syntax if possible.
19. Browser-open URL after first fixes to observe console.
20. Continue to animal AI after stabilizing critical console errors.

Awtsmoos insight: do not tear every wall at once. First stop the leaking sky; then repair the compass; then teach the villagers and beasts to breathe.