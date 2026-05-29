B"H
# Paper Solvability Audit Plan

## User correction
Do not live-play. Do not pretend graph = human. Read authored/enriched level data and reason like a human would encounter it.

## What to inspect per level
- spawn to first solid
- main route platform spacing and y deltas
- coin/key positions relative to reachable/readable solids
- door position relative to final solids
- hazards near mandatory route
- trick platforms: safeSpike, dodgePlatform, baitShift, phantom, falseSpike, commitDrop, booster, ice, oneWay
- upper route readability via guaranteed ascent and mid-route spine
- camera/readability implications from high/sky y bands and x spacing

## Human paper thresholds
- SAFE: edge gap <= 90 and rise <= 80
- TIGHT: edge gap <= 130 or rise <= 116, but readable from visible neighbor
- EXTREME: beyond authored regression threshold or requires trick/momentum without nearby teaching
- FAIL: unreachable collectible/key/door by static reading, mandatory lethal overlap, hidden mandatory route, or no visible next platform

## Method
1. Generate per-level route summaries from imported enriched level objects.
2. For each level, identify farthest authored coin/key/door and nearest platform.
3. Inspect failing/suspicious levels by reading their source.
4. Produce PASS/WARNING/FAIL with notes, not fake certainty.
