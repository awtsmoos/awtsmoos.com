B"H
# Map Quality + Performance Full Implementation Plan

## User mandate
Do it all now and more: map quality, map personality, heat zones, flow graph, recovery, edge hotspots, stage control, performance caching, culling, map-specific AI, diagnostics, audit tools.

## Inspected truth
- Maps are made through `js/data/maps/factory.js`.
- Platform graph already caches on `map.__aiMindGraph`, but no personality/zones/analysis gateway exists.
- AI uses `platformGraph(map)`, `worldModel.js`, `targetScoring.js`, `platformDesireMap.js`.
- Renderer path needs deeper inspection before risky render changes; first pass can add map culling/cache utilities and tools without breaking visuals.

## Implementation plan
Create:
1. `js/maps/mapPersonality.js` — derive/normalize personality from id/theme/rules/tags.
2. `js/maps/mapAnalysis.js` — bounds, center, platform sizes, edges, recovery/danger/control metrics.
3. `js/maps/mapZones.js` — centerControl, edgeKill, recoverySafe, landingTrap, danger zones.
4. `js/maps/mapFlowGraph.js` — cached wrapper over platform graph with costs and zone annotations.
5. `js/maps/mapCulling.js` — visible platform/wall/hazard query from camera bounds.
6. `js/maps/mapPerformanceCache.js` — static cache metadata and invalidation keys.
7. `tools/map-audit.mjs` — first-hit, damage/min, quiet, warnings.
8. `tools/map-zone-report.mjs` — print map zones/personality/analysis.
9. `tools/map-performance-report.mjs` — object counts, cache keys, culled counts.

Rewrite:
1. `js/data/maps/factory.js` — enrich every map with personality, analysis, zones, flowGraph meta lazily/once.
2. `js/ai/advanced/navigation/platformGraph.js` — use `map.__flowGraph` when present and retain cached behavior.
3. `js/ai/advanced/navigation/worldModel.js` — expose mapAnalysis, mapZones, mapPersonality, flowGraph.
4. `js/ai/advanced/navigation/targetScoring.js` — use zones/personality/rivalry.
5. `js/ai/advanced/strategy/platformDesireMap.js` — zone-aware desire.
6. `js/ai/advanced/combat/positionPlanner.js` — use edge/landing/control hotspots.

Extra improvements:
- Map quality score in reports.
- Engagement score from spawn clustering and center distance.
- Danger/control zone counts.
- No renderer rewrite until utilities verified; avoid breaking browser visuals.

## Verification
- import all maps.
- run map-zone-report.
- run map-performance-report.
- run map-audit.
- run reforge-audit and simulate-ai-match.
