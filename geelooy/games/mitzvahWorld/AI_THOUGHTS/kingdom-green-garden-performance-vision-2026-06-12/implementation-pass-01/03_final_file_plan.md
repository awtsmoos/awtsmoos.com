B'H
# Final File Plan Before Code

## Create small modules

- KingdomPerformanceBudget: caps, degradation, summary.
- KingdomWorldClock: deterministic day phase and elapsed time.
- KingdomChunkMap: chunk keys, chunk summaries from ecology and entities.
- KingdomSpatialIndex: bounded bucket lookup.
- KingdomEventBus: capped event ledger.
- KingdomProofLedger: proof entries.
- KingdomSaveSnapshot: compact save state.
- KingdomGardenKernel: composition of all kingdom primitives.
- InterestBubble: radius/tier interest policy.
- SimulationTierModel: tier assignment and update rates.
- SimulationScheduler: time-sliced task scheduler.
- OfflineCatchup: summary time gap math.
- KingdomHeadlessProof: single importable proof function.

## Rewrite existing files

- MitzvahRegionDirector: import kernel, build it after colliders, include in report.
- LivingRegionRuntime: expose kingdom budget/runtime summary in stats.
- RegionBuildReport: count kingdom chunks and tier summary.

## Validation commands

1. Import proof module.
2. Run director smoke proof and confirm old counts still exist.
3. Confirm new `summary.kingdomChunks` and `kingdom.summary.ok` exist.

## Stop condition for this pass

This pass is complete only if:

- all new modules parse
- existing director still returns old proof counts
- new kingdom summary is visible
- no browser-heavy proof is required to validate foundation
