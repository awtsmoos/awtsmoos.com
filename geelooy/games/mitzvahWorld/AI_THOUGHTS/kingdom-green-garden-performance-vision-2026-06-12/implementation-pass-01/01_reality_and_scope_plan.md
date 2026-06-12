B'H
# Implementation Pass 01 — Reality and Scope Plan

The user asked to implement literally everything. The full kingdom vision is larger than one safe pass, so this pass must create the foundation that makes every later feature possible without destroying the already proven living region.

## Existing verified spine

- Director report exists and proves ecology, roads, houses, wildlife, NPC schedules, colliders, and visual instances.
- Runtime layer exists and proves visual layers, wildlife ticker, NPC runtime, and merged colliders.
- Current weakness: no canonical kernel for budget, chunks, tiering, spatial queries, event flow, snapshots, or headless simulation.

## Pass 01 goal

Implement the Kingdom Garden foundation:

1. Performance budget model.
2. World clock.
3. Chunk map.
4. Spatial index.
5. Event bus.
6. Simulation tier model.
7. Simulation scheduler.
8. Snapshot/catch-up primitives.
9. Proof ledger.
10. Kernel composition.
11. Wire kernel summary into director report.
12. Wire runtime performance stats into living runtime.
13. Add smoke proof.

## Files to create

- `region/kingdom/KingdomPerformanceBudget.js`
- `region/kingdom/KingdomWorldClock.js`
- `region/kingdom/KingdomChunkMap.js`
- `region/kingdom/KingdomSpatialIndex.js`
- `region/kingdom/KingdomEventBus.js`
- `region/kingdom/KingdomProofLedger.js`
- `region/kingdom/KingdomSaveSnapshot.js`
- `region/kingdom/KingdomGardenKernel.js`
- `region/simulation/SimulationTierModel.js`
- `region/simulation/SimulationScheduler.js`
- `region/simulation/InterestBubble.js`
- `region/simulation/OfflineCatchup.js`
- `region/proof/KingdomHeadlessProof.js`

## Files to rewrite fully

- `region/MitzvahRegionDirector.js`
- `region/render/LivingRegionRuntime.js`
- maybe `region/debug/RegionBuildReport.js`

## Constraints

- Preserve existing proof counts.
- Do not make heavy browser proof required for smoke validation.
- Do not increase hot-loop cost.
- Keep modules small.
- Every new system must have caps or summaries.

## Verification

- Node syntax import smoke.
- Director proof must still return existing summary counts.
- New report must include `kingdom` summary.
- Headless proof must show budget, chunks, tiers, snapshot, and event ledger.
