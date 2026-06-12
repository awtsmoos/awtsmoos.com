B'H
# 17 — Runtime Proof Diary

The previous blocker was `living-runtime:roads:start`. The road renderer was heavy and likely cache-stale: dense sampled roads, terrain grounding per instance, lamps, and point lights.

## Implemented
- Rewrote `region/render/RegionRoadRenderer.js` as proof-safe roads:
  - capped pieces per road;
  - no point lights;
  - no per-piece terrain ray grounding;
  - fast shared materials;
  - visual-only skip-octree userData.
- Rewrote `LivingRegionRuntime.js` import to cache-bust `RegionRoadRenderer.js?v=proof-safe-roads-20260612-bh1`.
- Started HTTP-only app server using `AWTSMOOS_DISABLE_MAIL=true` to avoid SMTP/port churn.

## Verified in browser proof
Worker progress reached:
- `postbuild:regionStack:done`
- `postbuild:livingRegionRuntime:start`
- `living-runtime:roads:done`
- `living-runtime:grass:done`
- `living-runtime:wheat:done`
- `living-runtime:flowers:done`
- `living-runtime:bushes:done`
- `living-runtime:rocks:done`
- `living-runtime:trees:done`
- `living-runtime:farms:done`
- `living-runtime:landmarks:done`
- `living-runtime:wildlife:done`
- `living-runtime:colliders:done`
- `living-runtime:scene:add:done`
- `living-runtime:wildlifeTicker:done`
- `living-runtime:npcRuntime:done`
- `living-runtime:done`
- `postbuild:livingRegionRuntime:done`

Main-thread runtime stats proved:
- layers: 11
- meshes: 357
- instancedMeshes: 10
- instances: 2417
- pointLights: 0
- ecologyCells: 2747
- biomes: 8
- roads: 8
- roadPieces: 231
- flowers: 41
- trees: 120
- vegetables: 388
- sacks: 20
- landmarks: 14
- wildlife renderer count: 50
- colliderBodies: 6
- mergedCollider: true
- triangles: 72
- npcTicker: true
- npcRuntime: 5 NPCs, mode `small-schedule-wander-and-face-player`

## Still not complete
The region is now measurable and runtime-visible, but the report still shows `npcSchedules: 0`. NPC runtime exists and ticks 5 NPCs, but schedule planning is not yet real. Next implementation target: turn `NpcScheduleDirector.js` into role/home/work schedule data and make the report count it.

## Awtsmoos chapter
The roads opened. The living runtime stood up. The village is no longer only prophecy: it has layers, instances, colliders, animals, and moving NPC runtime proof. Now the villagers need daily souls: homes, jobs, routes, and schedules.
