B'H
# Phase Two Actual Plan — After Real Inspection

Real git proof found:
- In commit `5929467f6`, `controls.js` maps W=FORWARD, S=BACKWARD, A/D rotate, Q/E strafe.
- Old `movementDirection` uses `player.rotation.y`, forward vector `(sin(rotY), cos(rotY))`, side vector `(-cos(rotY), sin(rotY))`.
- Old `syncVisual` for model not parented to moving root sets `modelMesh.rotation.y = player.rotation.y + rotateOffset` and `modelMesh.position.copy(player.mesh.position)`.
- Current camera update still has the old right+left mouse auto-W injection. This may cause random movement when interacting unless UI suppresses camera input.

Real terrain proof found:
- `levels/ladder/source/village/sections/ProceduralTerrain.js` is the active compact village section. Width 460, depth 420. Houses/mobs can be outside if world spans bigger than this.
- TerrainMath already supports points, hills, roads, plateaus. We can add broad hills in data.
- Grounding file has a weak `terrainLawY` nearest-height-point fallback instead of the true `TerrainMath.calculateHeightAt`, so it can ground objects wrong/floating when hills/roads/plateaus exist.

Actual change list:
1. Rewrite `TerrainMath.js` only if needed? It already supports hills and roads; no change required unless adding named safe path flatten helpers.
2. Rewrite `villageGrounding.js` so `terrainLawY` uses `TerrainMath.calculateHeightAt` exactly, not nearest heightPoints. Add broad all-scene candidate grounding, floating suspect report, and less noisy copy-ready diagnostics.
3. Rewrite village ProceduralTerrain section: bigger map, more segments, broad hills, roads/plateaus expanded so paths and houses are on surface.
4. Rewrite camera update to respect `olam.__awtsmoosSuppressCameraUntil` and `showingImportantMessage`; stop auto-W injection during UI/NPC proximity; reduce camera collision choppiness by caching/rate-limiting worldOctree ray in same frame if target near NPC? Start with UI suppression.
5. Restore exact old physics syncVisual behavior where possible: current parented model logic may be correct for visible-root fix, but controls issue is likely cache and/or camera injection. Only change if we can preserve binding.
6. Add a compact diagnostic helper module and import it in controls/physics/grounding/NPC. It stores ring buffer and exposes `globalThis.__AWTSMOOS_DIAG_COPY__()`.
7. Better logs: one short console.info on boot telling user how to copy diagnostics, not constant spam.

20 improvements to do in this pass:
1. Real `TerrainMath` grounding in `villageGrounding`.
2. Ground all scene roots with village/userData tags, not only a small type set.
3. Use bounding box minY for static meshes.
4. Keep player/animals as living sync types.
5. Skip cameras, lights, sky, UI, helpers.
6. Report top floating suspects into diagnostic buffer.
7. Add `groundVillageNow(..., source)` diagnostic summary.
8. Re-ground after battle layer installs mobs/decor.
9. Bigger map width/depth from 460/420 to 760/720.
10. Higher terrain segments for smoother hills.
11. Add hills far from path.
12. Add path/house plateaus to keep buildings usable.
13. Add road flattening for all main paths.
14. Clamp the old terrain position and no safety slab unchanged.
15. Camera update respects UI suppression marker.
16. Camera update releases auto-W when suppressed.
17. Controls diagnostic trace reduced but copy-ready.
18. Global diag copy helper with JSON payload.
19. Choppy frame sampler for dt > 45ms with nearby NPC/entity names if available.
20. Cache-bust imports for touched modules.

Awtsmoos thought: The old controls were not a rumor; they were a commit. The world did not need louder logs; it needed one scroll that remembers truth. The ground did not need guessing nearest point; it needed the same terrain law that made the hills.