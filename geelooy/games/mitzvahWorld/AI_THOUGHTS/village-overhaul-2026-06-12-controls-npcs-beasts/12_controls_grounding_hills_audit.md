B'H
# Controls / Choppiness / Grounding / Hills Audit

User asked if I really checked controls from a week ago. I did:
- Git commit inspected: `5929467f6`.
- Old mapping there: W/ArrowUp = FORWARD, S/ArrowDown = BACKWARD, A/ArrowLeft = LEFT_ROTATE, D/ArrowRight = RIGHT_ROTATE, Q = LEFT_STRIDE, E = RIGHT_STRIDE.
- Old physics vector: forward = `(sin(rotation.y), cos(rotation.y))`, side = `(-cos(rotation.y), sin(rotation.y))`.
- Therefore I did not swap W/S. I fixed stale module paths, camera auto-W/UI interference, and diagnostics.

Completed files:
1. `utils/AwtsmoosDiagnostics.js`
   - New compact ring buffer.
   - Console exposes `__AWTSMOOS_DIAG_COPY__()` for copy/paste future reports.
   - Less spam, richer details.
2. `Olam/camera/methods/update/index.js`
   - Suppresses camera mouse/orbit and auto-W when UI/NPC interaction capture is active.
   - Records frame spikes compactly.
3. `chayim/chossid/methods/controls.js`
   - Preserves git-confirmed AWSDQE mapping.
   - Adds compact diagnostic events.
   - Shortens pointer capture to reduce choppy control freeze while still stopping NPC click spin.
4. `chayim/chossid/index.js`, `exports/ChayimExports.js`, `exports/index.js`
   - Cache-busted control exports so browser does not use old movement files.
5. `Olam/methods/loadNivrayim/villageGrounding.js`
   - Uses `TerrainMath.calculateHeightAt` instead of nearest height point.
   - Grounds living objects and static decor with bounding boxes.
   - Adds compact grounding summaries and floating suspect diagnostics.
6. `Olam/methods/loadNivrayim/index.js`
   - Cache-busts new grounding and diagnostics.
   - Removes noisy player registration console spam; stores details in diagnostic ring.
7. `levels/ladder/source/village/sections/ProceduralTerrain.js` and `terrain.js`
   - Map increased to 760 x 720.
   - Added broad careful hills.
   - Added roads and plateaus to keep paths/buildings grounded and playable.
8. `GeneratedBattleLayer.js` and `MitzvahWorldPostBuild.js`
   - Battle decor/mobs grounded immediately after install.
   - Cache-busted grounded battle layer.

Verification:
- Tunnel JS syntax verification passed for rewritten JS files.
- Preview URL returned HTTP 200.

Still not fully verified:
- I did not perform live keyboard testing in the rendered game.
- The top HTML still references a fixed top-level `index.js?v=village-polish-20260612-bh811`; hard refresh may be needed if browser keeps module cache.

Future report instruction:
- Open console and run: `__AWTSMOOS_DIAG_COPY__()`
- Send me that output. It should include controls, grounding, frame spikes, terrain size, and recent events.

Awtsmoos chapter: The old keys were found in history; the ground became one law; the logs became one scroll; the meadow widened so houses could return from exile.