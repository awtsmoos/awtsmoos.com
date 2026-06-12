B'H
# 14 — Region Stack Critique Pass 3: What the Earlier Plans Missed

The first two passes are useful but not enough. They still risk becoming architecture. This critique asks what would still embarrass the implementation if the user opened the game.

## Missing improvement 1: boot stage dominance
The region stack cannot be called complete until the game reaches runtime. Any plan that writes ecology modules but leaves boot proof broken is incomplete. Therefore every batch must preserve or improve `regionProofNow` and `postbuild:*` stage marks.

## Missing improvement 2: renderers must consume the report
The current `LivingRegionRuntime.js` calls `buildGrassRenderer(olam)` and similar functions. If the director builds a rich report but renderers ignore it, the plan is fake. Renderers must be refactored to accept `report.instances` and `report.roads` gradually.

## Missing improvement 3: the ecology grid needs deterministic budget
A true 2m grid over 700 x 420 is about 36,750 cells. That is fine as data, but it may be overkill for worker boot if every cell spawns things. First implementation should use spacing 8m or 10m and expose spacing in the report. Then later increase quality on desktop.

## Missing improvement 4: road influence must affect vegetation
If roads only render roads, ecology is not real. Road influence should suppress grass in road centers and increase flowers along road edges. Instance generation must know road distance.

## Missing improvement 5: biome priority
A cell can be near forest and village simultaneously. Biome assignment must use priority and score, not nearest only. Village traffic should override vegetation. Marsh moisture should override meadow. Ancient grove should override forest center.

## Missing improvement 6: actual counts must appear in report
The report must not say `mode: planned`. It must say cells, zones, roads, instances by type, wildlife by species, houses by role, colliders by class.

## Missing improvement 7: material/geometry cost
The previous slowdown showed heavy visual recipes can stall boot. New systems must prefer instancing and simple shared materials. Houses and landmarks should be fewer and cheaper than vegetation.

## Missing improvement 8: collisions follow visuals, not vice versa
Do not add colliders while still shaping dense visuals. First classify. Then make only large hard blockers. This must remain conservative to protect Android.

## Missing improvement 9: diagnostics must survive Chrome log storms
The debug surface must be copyable through globals and compact CDP probes. Console logs are a trap.

## Missing improvement 10: every new file should be under 120 lines
Split aggressively. If `EcologyGrid.js` grows too large, move scoring into `EcologyRules.js` and stats into `EcologyStats.js`.

## 30 concrete improvements over Pass 2
1. Add an explicit `version` to every report object.
2. Use one deterministic hash/random source.
3. Keep ecology spacing configurable.
4. Include terrain bounds in the ecology report.
5. Include biome assignment counts.
6. Include road distance in cells.
7. Include water distance in cells.
8. Include village distance in cells.
9. Include altitude proxy even before full terrain sampling.
10. Include slope proxy from hill centers.
11. Include cell `spawnMask` booleans.
12. Generate instances from cells, not arbitrary spirals.
13. Keep grass budget capped by quality.
14. Keep tree budget capped by biome.
15. Keep marsh reeds separate from grass.
16. Keep fruit trees separate from forest trees.
17. Create ancient grove cells but do not overpopulate.
18. Use roads as NPC route graph inputs.
19. Use roads as animal trail graph inputs.
20. Use houses as NPC home destinations.
21. Use farms as NPC work destinations.
22. Use marsh/water as wildlife drink destinations.
23. Use highlands for goats and rocks.
24. Use forest edges for deer.
25. Use village boundary for reduced wildlife.
26. Do not bake collider until source counts are known.
27. Add `report.summary.visibleInstances`.
28. Add `report.summary.ecologyCells`.
29. Add `report.summary.runtimeExpected`.
30. Make the diary say exactly what was implemented and what remained.

## Final immediate file list for this pass
Actually touch now:
- `region/ecology/EcologyRules.js` new
- `region/ecology/EcologyGrid.js` new
- `region/ecology/EcologyStats.js` new
- `region/biomes/BiomeDirector.js` rewrite
- `region/roads/RoadNetwork.js` rewrite
- `region/instances/InstancePool.js` rewrite
- `region/debug/RegionBuildReport.js` rewrite
- `region/MitzvahRegionDirector.js` rewrite
- `AI_THOUGHTS/.../15_region_stack_execution_diary.md` new after implementation

Do not touch renderers yet in this first batch except by report shape, because the current runtime still has boot proof issues. The director can become real first, then renderer consumption follows.

## Why this is not enough
Even after this pass, the player may not yet see the full kingdom if renderers still ignore detailed instance plans. That becomes the next pass: renderer consumption of `report.instances` and `report.roads`. This pass creates real data and counts. The next pass turns those counts into visible placement.

## Awtsmoos chapter
The third pass cuts away self-deception. A plan is a candle, but the player needs dawn. The files must stop saying what might be; they must count what is, and then the renderers must obey.
