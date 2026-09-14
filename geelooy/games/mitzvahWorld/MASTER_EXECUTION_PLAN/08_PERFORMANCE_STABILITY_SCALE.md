B"H
Boruch Hashem
Blessed be He

# 08 — Performance, Streaming, Stability, 50M-Scale Readiness

## FPS law
Gameplay responsiveness wins over enrichment. No subsystem owns the frame budget independently.

## Runtime budgets
- [ ] one global frame-budget authority coordinating terrain, vegetation, NPCs, physics, weather, audio, UI, streaming;
- [ ] explicit CPU ms, GPU work, draw calls, triangles, transparency/overdraw, texture memory, simulation entities, Worker memory;
- [ ] device-class initial profiles plus live adaptive controller;
- [ ] graceful degradation order preserves silhouette/gameplay truth before visual microdetail;
- [ ] gradual quality recovery when headroom returns;
- [ ] never let graphics quality alter quest/world truth.

## Streaming / scheduling
- [ ] worker-first heavy terrain/vegetation/nav/geometry generation;
- [ ] transfer typed arrays where beneficial; no unnecessary copies;
- [ ] cancellation tokens for generation/asset/network tasks when player leaves region;
- [ ] priority queue based on camera distance, visibility, gameplay importance, required-before-optional;
- [ ] deterministic cell seeds and border consistency;
- [ ] hierarchical simulation: near individuals, mid cohorts, far statistics;
- [ ] visibility-aware streaming, occlusion/portal hints, interior cells, distant impostors;
- [ ] world switching explicitly disposes GPU, Workers, audio, timers, physics, nav, subscriptions.

## Metrics
- [ ] time-to-first-meaningful-frame;
- [ ] time-to-first-control (input actually changes player);
- [ ] P50/P95/P99 frame time and FPS, not average only;
- [ ] peak/steady RAM, GPU resource count, loaded bytes, Worker count;
- [ ] JS/runtime error rate, context loss, save errors, transaction failures;
- [ ] performance receipts per generated tree/terrain/city chunk in debug mode.
## Stability / failure recovery
- [ ] no optional service blocks boot; every optional dependency has timeout, cancellation, retry/backoff, and degradation receipt;
- [ ] GPU/context-loss recovery;
- [ ] Android/browser background/suspend/resume recovery;
- [ ] corrupt cache detection/rebuild; low-storage behavior; memory-pressure response;
- [ ] save transaction journaling/recovery; crash breadcrumbs;
- [ ] long-running world traversal soak test and teleport stress test;
- [ ] world A→B→C→A cleanup soak; memory must plateau;
- [ ] fuzz invalid/NaN/extreme AI configs; clamp recursion/counts/allocations;
- [ ] deterministic replay package records seed, position, world time, generator versions, config, state deltas.

## 50 million concurrent reality
The project is not 50M-concurrent ready until measured load proves it. Single-player static delivery can scale through CDN independently; shared realtime state is a different system.
- [ ] multi-region CDN/object storage for immutable assets;
- [ ] stateless scalable gateways, regional service isolation, backpressure and load shedding;
- [ ] sharded/partitioned persistent data and presence;
- [ ] interest management: never broadcast every player/NPC/world event to everybody;
- [ ] spatial partitions for multiplayer worlds and regional presence summaries;
- [ ] server-authoritative meaningful shared transactions; client reconstructs deterministic procedural baseline;
- [ ] queues for non-interactive work; hot-key/hot-world protection; cache stampede/thundering-herd control;
- [ ] global/regional rate limits with graceful user-facing degradation;
- [ ] feature kill switches for expensive optional systems;
- [ ] abuse/anti-cheat boundaries where shared state matters.

## Capacity ladder
- [ ] 1 user multi-hour crash-free play;
- [ ] all official worlds cold/warm/offline boot reliably;
- [ ] hundreds of automated clients;
- [ ] 10k concurrent synthetic sessions;
- [ ] 100k regional load;
- [ ] 1M+ multi-region load with failover;
- [ ] only raise targets after measured headroom, cost, latency, error-rate, and recovery evidence.

## Disaster readiness
- [ ] canary deploys, automated rollback, feature flags, health endpoints;
- [ ] regional failover drills;
- [ ] database/asset backup and actual restore drills;
- [ ] provider/CDN/network outage exercises;
- [ ] production dashboards and alerts exist before viral traffic.