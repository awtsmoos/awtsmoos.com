B"H
# Map Quality + Performance Post Review

## Implemented
- Added automatic map enrichment through `js/data/maps/factory.js`.
- Every map now gets:
  - `map.personality`
  - `map.analysis`
  - `map.zones`
  - `map.performance`
- Added zone-aware platform graph metadata.
- Added map intelligence into AI world model.
- Added zone/personality-aware target scoring.
- Added zone-aware platform desire scoring.
- Added map culling helpers for future renderer integration.
- Added static performance cache metadata.
- Added map reports and audits.
- Retuned `merkava-pinball-court` again after audit exposed low short-match quality.

## Files created
- `js/maps/mapPersonality.js`
- `js/maps/mapAnalysis.js`
- `js/maps/mapZones.js`
- `js/maps/mapFlowGraph.js`
- `js/maps/mapCulling.js`
- `js/maps/mapPerformanceCache.js`
- `tools/map-zone-report.mjs`
- `tools/map-performance-report.mjs`
- `tools/map-audit.mjs`

## Files rewritten
- `js/data/maps/factory.js`
- `js/ai/advanced/navigation/platformGraph.js`
- `js/ai/advanced/navigation/worldModel.js`
- `js/ai/advanced/navigation/targetScoring.js`
- `js/ai/advanced/strategy/platformDesireMap.js`
- `js/data/maps/merkavaPinballCourt.js`

## Verification
- `node tools/map-zone-report.mjs` completed for 22 maps.
- `node tools/map-performance-report.mjs` completed for 22 maps.
- Android `/tmp` redirection was denied, so reports were written to `.reports/` instead.
- Full all-map audit was too heavy and hit a tunnel 504; targeted map audits were run instead.
- Targeted audits passed for:
  - `merkava-pinball-court`
  - `tiferes-vast`
  - `beit-midrash-bouncer`
- Standard reforge audit passed:
  - ok true
  - warnings none
  - invalidAttackCommands 0
  - averageDamagePerMinute 288.33
  - totalKos 6
- Standard AI sim passed:
  - ok true
  - warnings none
  - invalidAttackCommands 0
  - namelessJumps 0

## Important measured improvement
`merkava-pinball-court` before final retune:
- quality 24
- engagementScore 115
- spawnSpread 3225
- attackCommands 16
- damagePerMinute 22

After final retune:
- quality 47
- engagementScore 474
- spawnSpread 1881
- attackCommands 256
- damagePerMinute 69
- koCount 3

## Line counts
All touched JS/tool files stayed under 100 lines except none; biggest touched files:
- `worldModel.js`: 93
- `platformGraph.js`: 58
- `factory.js`: 51
- `platformDesireMap.js`: 45

## Honest remaining work
- Renderer does not yet consume `mapCulling.js` for actual draw culling; the utility exists and reports validate it, but integrating into renderer needs a renderer-specific pass.
- Static canvas layer caching is represented as metadata, not a full draw-cache implementation yet.
- Full all-map map-audit on Android tunnel is heavy and can 504; future work should add chunked audit mode.

## Chapter close
The maps now have memory before the match begins. Each arena knows its temperament, its center, its edges, its traps, its recovery mercy, and its performance burden. The bots no longer walk on anonymous rectangles; they walk through named zones of purpose.
