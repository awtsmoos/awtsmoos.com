B'H
# Phase One — Controls, Choppiness, Grounding, Hills, Bigger Map, Better Logs

The user reports:
1. Controls are still messed up. Need real AWSDQE comparison from about a week ago, not assumptions.
2. Choppiness occurs for a few frames near NPCs or similar proximity events.
3. Logs are noisy/not useful. Need fewer but copy-ready diagnostic logs containing all relevant details.
4. Several things float / levitate. Need a forever grounding algorithm for all world objects.
5. Add a few hills carefully, and ground items should match them.
6. Houses are outside map; make map bigger.
7. Think of at least 20 improvements and do them all.

First brainstorm of possible causes and improvements:
- Controls may be broken not in `controls.js`, but in physics vector sign, model forward rotation, camera yaw binding, key bindings manifest, mobile input flags, or camera auto-forward injection.
- Git history must inspect multiple commits and files: controls.js, physics/index.js, physics/movement.js, KeyBindingsManifest.js, Olam/camera/methods/update/index.js, maybe input handlers.
- W/A/S/D/Q/E historic covenant likely: W forward, S back, A/D rotate, Q/E strafe. But maybe older physics used -Z forward or model had different PI rotation, causing current W to feel opposite. Need compare exact old `movementDirection`, `syncVisual`, `modelMesh.rotation.y` and `group.rotation.y` changes.
- Choppiness near NPC likely from repeated ray/proximity scans, repeated overlay/prompt creation, expensive logging, asset size probes, animation mixer resets every frame, or generated NPC interaction ray proxies creating octree/raycast load.
- The new `InteractiveNpc.heesHawvoos` currently calls `setStandingPose(false)` every frame; it exits once clip same, but still may ask. Need make cheaper.
- Better logs: create a global diagnostic sampler that keeps a ring buffer and emits compact copy-ready JSON only on demand / every few seconds / when anomalies happen.
- Add `window.__AWTSMOOS_DIAG_COPY__()` or globalThis equivalent to copy all movement/NPC/animal/grounding data.
- Grounding: existing `scheduleVillageGrounding` likely does some work. Need inspect. Need persistent grounding pass that snaps all decor/NPC/houses/animals/collectibles to terrain law after terrain edits and when loading finishes.
- Floating objects may come from groundLift, authored y values, houses outside terrain bounds, terrain law not covering map, or collision octree height mismatch.
- Bigger map: inspect terrain/world config. Increase terrain dimensions / segments / bounds carefully, update houses or landscape recipe if needed.
- Hills: add procedural height features to terrain law or world terrain data; then grounding must use same height function. Need locate terrain generation data. Avoid random bumpy hills near spawn/path unless placed carefully.

20 concrete improvements to implement if files support it:
1. Restore exact historical movement vector signs from git after comparison.
2. Restore exact historical Q/E strafe signs.
3. Restore exact historical model rotation offset handling.
4. Disable camera auto-input if it injects KeyW during third-person unless intended.
5. Add copy-ready diagnostic buffer for controls: keys, inputs, moving flags, rotation, velocity, state.
6. Add copy-ready diagnostic buffer for NPC proximity spikes: frame time, hovered/interacting target, raycast counts if available.
7. Rate-limit noisy logs and make them structured.
8. Add `globalThis.__AWTSMOOS_DIAG__` helpers with `copy()`, `mark()`, `snapshot()`.
9. Ground all static objects after load with terrain law, not only some.
10. Re-ground after postbuild mobs/decor are added.
11. Mark objects that must not be grounded (sky, UI, helper roots, player, camera).
12. Snap houses/doors/fences/lamps/decor using bounding boxes so bottoms touch ground, not origins.
13. Snap animals with groundLift separately.
14. Extend terrain/map bounds.
15. Add several broad low hills away from main path and flatten spawn/path safety strips.
16. Make terrain height source single truth for ground and visual mesh.
17. Recompute terrain collision law after hill edits.
18. Clamp authored houses inside new terrain bounds or enlarge terrain enough to include them.
19. Add frame spike sampler to identify choppy frames with nearby NPC/entity names.
20. Add final audit log that user can paste: current controls source version, terrain bounds, grounded count, floating suspects.

Initial actual file targets to inspect:
- chayim/chossid/methods/controls.js
- chayim/chai/methods/physics/index.js
- divine_systems/input/keyboard/KeyBindingsManifest.js
- Olam/camera/methods/update/index.js
- Olam/methods/loadNivrayim/villageGrounding.js
- dvarim/terrain/core/TerrainMath.js
- world terrain data for village.json / data/nefashos
- postbuild/MitzvahWorldPostBuild.js and GeneratedBattleLayer.js for grounding after new objects

Awtsmoos chapter: The village speaks in symptoms. The feet stutter, the fox circles, the houses flee the map, the props hover like thoughts without vessels. The answer is not one patch but a covenant: input truth, terrain truth, grounding truth, and logs that become a letter the user can send back through the night.