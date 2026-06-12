B'H
# Architecture Brainstorm — Kingdom Garden Foundation

The completed kingdom cannot be one bigger loop. It must be a hierarchy of truth. The kernel will be the hidden crown: the player sees grass, animals, people, roads, homes, gardens, and stories, while the engine sees capped budgets, sleeping chunks, tier transitions, summarized populations, event ledgers, and snapshots.

## Core idea

The current region report is a generated snapshot. The new kernel is a living envelope around that snapshot. It does not replace the report. It blesses it with:

- bounded simulation
- chunk ownership
- interest radius
- budget gates
- proof summaries
- offline continuation hooks

## Data flow

```text
MitzvahRegionDirector
  terrain/biomes/roads/ecology/houses/instances/wildlife/npc/colliders
  -> buildKingdomGardenKernel
  -> RegionBuildReport
  -> LivingRegionRuntime
  -> runtime stats + visual layers
```

## Key decisions

1. The kernel is pure data and tiny functions; no Three.js import.
2. Runtime can read kernel summary but must not depend on heavy simulation.
3. Chunks own ecology cells, animals, houses, NPC schedule anchors, and instance counts.
4. Spatial index stores only light records.
5. Budget object gives deterministic degrade decisions.
6. Event bus stores bounded recent events.
7. Snapshot is compact and versioned.
8. Offline catchup is summary-only in pass 01.

## Pass 01 implementation level

Real but foundational:

- Real chunk creation from ecology bounds/cells.
- Real spatial buckets from wildlife and houses.
- Real tier assignment from interest bubble.
- Real budget summary and quality mode.
- Real proof ledger entries.
- Real save snapshot summary.
- Real headless proof.

Not yet complete:

- full NPC memory
- full population birth/death
- real resource depletion
- navgraph pathfinding
- house interiors as spaces
- actual render streaming

Those come after the kernel exists.

## Awtsmoos note

The Awtsmoos creates infinity from nothing every instant, yet reveals it through vessels. The kingdom must copy this pattern: infinite feeling, finite vessels, revealed only where the player can receive it.
