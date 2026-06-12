B'H
# Immense Cover Plan — Huge Kingdom Green Garden World With Guaranteed Hyper-Fast Performance

## Purpose

This note is a kingdom-covering plan for evolving the existing Mitzvah World region from proof-of-life into a vast green garden kingdom that feels alive, lush, populated, reactive, and spiritually purposeful, while staying hyper-fast no matter how many things appear to exist.

The guiding principle:

> The player may see a kingdom without the machine simulating a kingdom every frame.

The world must feel infinite, dense, soft, green, breathing, and full of mitzvah-life, but the engine must remain ruthless: capped, pooled, chunked, instanced, streamed, time-sliced, distance-aware, and proof-measured.

## Existing reality used as foundation

The current code already has a real living-region spine:

- `region/MitzvahRegionDirector.js` builds terrain, biomes, roads, ecology, houses, instances, wildlife, NPC schedules, colliders, and report.
- `region/render/LivingRegionRuntime.js` consumes the report into runtime layers.
- `region/ecology/EcologyGrid.js` creates ecology cells.
- `region/instances/InstancePool.js` creates visual instance plans from ecology.
- `region/roads/RoadNetwork.js` creates roads and trails.
- `region/render/RegionRoadRenderer.js` renders proof-safe roads.
- `region/wildlife/*` creates animals, species, needs, territories, predator/prey rules.
- `region/render/RegionWildlifeRenderer.js` animates animals with runtime state.
- `region/npc/*` creates role schedules and route anchors.
- `region/render/RegionNpcRuntime.js` moves NPCs by time phase.
- `region/collision/*` and `region/render/RegionColliderRuntime.js` create merged hard collider proof.
- `region/debug/RegionBuildReport.js` counts the kingdom instead of flattering it.

Fresh proof already showed:

- ecology cells: 2747
- biomes: 8
- roads: 8
- houses: 4
- wildlife: 56
- npc schedules: 7
- hard colliders: 4
- visible instances: 1339

This is the seed. Not the forest. Not the kingdom. The seed.

## Final vision

A huge kingdom green garden world:

- rolling fields
- orchards
- forests
- marshes
- ancient groves
- farms
- villages
- roads
- trails
- gardens
- schools
- markets
- beis midrash spaces
- homes with families
- wildlife territories
- herds, birds, insects, frogs, goats, deer, foxes, rabbits
- NPCs with homes, memory, work, learning, prayer, eating, kindness, errands, needs, and relationships
- grass that appears endless
- flowers that appear countless
- trees that appear like forests
- people that appear like a society
- animals that appear like ecology
- events that continue when the player leaves

But performance must remain guaranteed by architecture, not hope.

## The performance covenant

Never simulate what the player cannot meaningfully perceive.
Never render uniquely what can be instanced.
Never tick every entity every frame.
Never allocate in hot loops.
Never raycast per decorative object.
Never give every visual object agency.
Never let proof depend on ornament.
Never let density equal cost.

The kingdom must use layered truth:

1. **Full simulation truth** — tiny set near player or narratively important.
2. **Coarse simulation truth** — chunk-level numbers and events.
3. **Visual illusion truth** — instanced, pooled, shader-wind, no unique AI.
4. **Narrative summary truth** — things happened offscreen as summarized events.
5. **Dormant truth** — saved seeds and compressed state, not active objects.

## Core architecture: KingdomGardenKernel

Future structure:

```text
region/
  kingdom/
    KingdomGardenKernel.js
    KingdomPerformanceBudget.js
    KingdomWorldClock.js
    KingdomChunkMap.js
    KingdomSpatialIndex.js
    KingdomEventBus.js
    KingdomProofLedger.js
    KingdomSaveSnapshot.js
  simulation/
    SimulationScheduler.js
    SimulationTierModel.js
    InterestBubble.js
    OfflineCatchup.js
  ecology/
    EcologyGrid.js
    EcologyChunkState.js
    PlantResourceSystem.js
    GrassPressureSystem.js
    WaterResourceSystem.js
  npc/
    NpcScheduleDirector.js
    NpcActivityGraph.js
    NpcMemoryLedger.js
    NpcSocialGraph.js
    NpcHouseholdSystem.js
    NpcWorkSystem.js
  wildlife/
    WildlifeDirector.js
    WildlifePopulationSystem.js
    WildlifeNeedsSystem.js
    PredatorPreySystem.js
    MigrationSystem.js
  render/
    LivingRegionRuntime.js
    KingdomChunkRenderer.js
    KingdomInstanceStreamer.js
    KingdomImpostorRenderer.js
    KingdomLodPolicy.js
    KingdomPerfHud.js
  proof/
    KingdomHeadlessProof.js
    KingdomRuntimeProof.js
    KingdomPerfProof.js
```

## The magic trick: one kingdom, five simulation tiers

### Tier 0 — Immediate bubble

Radius near player.

Contains:
- fully animated NPCs
- fully reactive wildlife
- interactable plants/resources
- real collision
- talk prompts
- mitzvah opportunities

Budget:
- 5 to 20 full NPCs
- 20 to 80 active animals
- 500 to 3000 nearby instances
- strict frame budget

### Tier 1 — Nearby living chunks

Visible but not directly interactive.

Contains:
- simplified NPC movement
- simple wildlife steering
- animated instanced vegetation
- chunk-level resource updates

Budget:
- no unique expensive logic
- tick every 0.25 to 1 second
- shared state machines

### Tier 2 — Far visible kingdom

Mountains, forests, fields, village silhouettes.

Contains:
- impostors
- instanced forests
- baked roads
- shader motion
- billboard clusters

Budget:
- almost zero CPU
- GPU instancing only
- no collision except macro blockers

### Tier 3 — Offscreen simulated chunks

Not visible.

Contains:
- numbers, not meshes
- population counts
- hunger averages
- resource pressure
- event probabilities

Budget:
- tick every 5 to 60 seconds
- chunk summaries only

### Tier 4 — Dormant kingdom memory

Far away or unloaded.

Contains:
- seed
- last simulated time
- compressed events
- population/resource summary

Budget:
- zero frame cost
- catch up only when needed

## Guaranteed performance systems

### 1. Performance budget manager

Every system must request budget before work.

Budgets:
- CPU ms per frame
- draw calls
- triangles
- active tickers
- active colliders
- active NPCs
- active animals
- active interactables
- memory pools

If budget is exceeded, quality degrades gracefully:

- reduce far animation
- lower wildlife update rate
- collapse NPCs into summary agents
- replace animals with flock impostors
- reduce grass density visually but preserve perceived fullness
- delay non-critical event processing

### 2. Interest bubble

Only the area around the player gets high fidelity.

Interest sources:
- player position
- active quest/mitzvah target
- NPC being spoken to
- danger/event location
- camera direction
- recent player memory

Everything else becomes summary.

### 3. Chunked world

The kingdom must be chunked.

Each chunk stores:
- biome
- ecology cells
- instance seeds
- resource summary
- NPC population summary
- wildlife population summary
- road links
- nav links
- collider summary
- last simulated time

### 4. Spatial index

No `for every animal find every rabbit` at scale.

Use buckets:
- chunk grid
- species buckets
- NPC buckets
- resource buckets
- event buckets

Predator/prey lookup becomes:

```text
fox asks nearby bucket for rabbits
not entire kingdom
```

### 5. Time-sliced simulation

No huge work in one frame.

Every system receives slices:

```text
frame 1: NPC chunk A
frame 2: wildlife chunk A
frame 3: ecology chunk A
frame 4: NPC chunk B
```

The player sees continuity. The CPU sees mercy.

### 6. Pool everything

Pools for:
- mesh groups
- instanced matrices
- NPC actor shells
- animal actor shells
- particles
- flowers
- grass clumps
- collision proxies
- event objects

No constant creation/destruction during play.

### 7. Instance-first rendering

Grass, flowers, rocks, reeds, mushrooms, vegetables, leaves, road pebbles, distant animals, market clutter, fences, orchard fruit: all instance-first.

Unique meshes only for:
- immediate interactables
- named NPCs
- story-relevant objects
- nearby animals
- doors/houses being entered

### 8. Renderer is never the simulation

Simulation state must exist without meshes.
Meshes are adapters.

This allows:
- headless tests
- offline catch-up
- low-end devices
- server-like simulation
- fast proofs

## Kingdom garden density plan

### Grass illusion

Do not place infinite grass.

Use layers:
- close grass: instanced blades/clumps
- mid grass: instanced patches
- far grass: terrain shader color/noise
- wind: shader only
- trampling: decal/texture field, not per blade

### Flower illusion

Use:
- ecology-driven flower clusters
- color fields at distance
- only nearby flowers get individual meshes
- pollination can be chunk-level, not per flower

### Forest illusion

Use:
- near real trees
- mid instanced tree variants
- far impostor cards
- skyline forest bands
- ancient grove hero trees only at special locations

### Wildlife illusion

Use:
- nearby animals as actors
- mid animals as simple moving dots/groups
- far herds as flock impostors
- offscreen animals as population counts

### NPC kingdom illusion

Use:
- named NPCs near player
- scheduled NPC shells in visible village
- distant villagers as route-following silhouettes
- offscreen villagers as household/workforce summaries

## Living systems roadmap

### Phase 1 — Proof-hardening and contracts

Goal: make current proof impossible to flatter.

Work:
- define `RegionReportSchema`
- validate report counts
- validate summary consistency
- add proof that wildlife count equals animals length
- add proof that schedules contain required phase destinations
- add proof that colliders match planned blockers
- add runtime proof that living-runtime done includes NPC/wildlife/colliders

Files:
- `region/debug/RegionBuildReport.js`
- `region/MitzvahRegionDirector.js`
- `AI_THOUGHTS/full-region-execution-2026-06-12/*Probe.mjs`
- new `region/proof/*`

Validation:
- node smoke proof
- browser proof
- no shader warmup required

### Phase 2 — Kingdom performance budget

Goal: guarantee speed before adding kingdom scale.

Work:
- add `KingdomPerformanceBudget.js`
- add hard caps per tier
- add adaptive quality policy
- add runtime stats ledger
- add perf HUD/debug report
- add fail-open degradation, not fail-freeze

Validation:
- artificial huge counts still render fast by degrading
- no system allowed uncapped loops
- test with 10x, 100x symbolic population

### Phase 3 — Chunk map and spatial index

Goal: make big world cheap.

Work:
- chunk ecology cells
- chunk instance plans
- chunk wildlife territories
- chunk NPC route anchors
- build spatial buckets
- update predator/prey and NPC queries to use buckets

Validation:
- lookup cost bounded by nearby buckets
- far chunks sleep
- moving player activates/deactivates chunks safely

### Phase 4 — Simulation tier model

Goal: one world, many fidelity levels.

Work:
- implement `SimulationTierModel`
- define Tier 0 to Tier 4
- move NPC/wildlife update rates into scheduler
- create dormant chunk state
- create catch-up math

Validation:
- NPC/animal state continues without visible mesh
- leaving/returning updates world logically
- renderer can be destroyed/recreated from simulation state

### Phase 5 — Huge green garden renderer

Goal: vast beauty without vast cost.

Work:
- chunked instanced grass
- chunked flowers
- tree impostors
- field color masks
- orchard bands
- far hills/forest silhouettes
- garden paths and terraces
- shader wind only where cheap

Validation:
- draw call budget remains bounded
- far world cost stays almost flat
- low-end mode keeps proof alive

### Phase 6 — NPC society

Goal: kingdom feels inhabited.

Work:
- households
- family roles
- teachers/students
- merchants/customers
- shliach/community network
- memory ledger
- favors/conflicts/kindness events
- activity graphs

Validation:
- NPC can explain where they are going
- NPC remembers player action
- NPC changes routine after event
- household has home/resources/sleep/work

### Phase 7 — Wildlife ecology

Goal: animals affect garden and each other.

Work:
- grazing pressure
- fear zones
- water seeking
- hunger/thirst consequence
- birth/death at chunk level
- migration
- predator success/failure

Validation:
- rabbits reduce grass pressure locally
- foxes reduce rabbit population statistically
- deer avoid player danger zones
- goats affect highland vegetation

### Phase 8 — Resource economy

Goal: grass, plants, food, homes, animals, and NPCs feed into each other.

Work:
- plant resource map
- farm production
- food storage
- household needs
- market supply
- village requests
- mitzvah opportunities from shortages

Validation:
- resources change over time
- NPC choices depend on resources
- player can help meaningfully

### Phase 9 — Offline kingdom continuation

Goal: world changes after 10 hours away.

Work:
- `KingdomSaveSnapshot`
- last simulated time
- chunk catch-up summaries
- event summaries
- population/resource deltas
- returning-world recap

Validation:
- save, simulate time gap, reload
- world has changed
- proof shows changed resources, NPC states, wildlife populations

### Phase 10 — Narrative emergence

Goal: mitzvah opportunities arise from living systems.

Examples:
- shepherd lost goats because foxes shifted territory
- merchant needs help because road washed out
- child forgot book at school
- farmer needs water carried
- shliach asks player to visit someone lonely
- animal wounded near path creates compassion choice
- garden overgrown creates beautification mitzvah

Validation:
- event has cause
- NPC remembers resolution
- world state changes afterward

## Absolute performance laws for future coding

1. Every new loop must state its maximum scale.
2. Every renderer must expose stats.
3. Every system must support low-end degradation.
4. Every simulation system must run headless.
5. Every entity type must define active/sleep/dormant behavior.
6. Every chunk must be unloadable.
7. Every visual layer must be reproducible from seed/state.
8. Every expensive proof must have a fast proof substitute.
9. Every future beauty pass must be optional ornament.
10. Every runtime proof must finish before ornament.

## The final shape

The player enters a green kingdom.

The grass moves like breath.
The trees rise like old teachers.
The roads remember feet.
The houses hold families.
The animals fear, hunger, graze, flee, return, multiply, vanish, and leave traces.
The villagers know morning, noon, evening, and night — then go beyond them into memory, kindness, need, and purpose.

But beneath the beauty, the engine is iron:

- chunks sleep
- far life becomes numbers
- numbers become stories
- stories become visible only when needed
- meshes are borrowed from pools
- instances carry forests
- shaders carry wind
- proofs carry truth

The Awtsmoos hides infinity inside finite vessels. So too the kingdom: infinite-feeling garden, finite guaranteed budget.

This is the cover plan: build not a bigger scene, but a smarter revelation of life.
