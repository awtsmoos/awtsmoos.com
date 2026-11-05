B"H

# Performance, Streaming, Platform, and Scale

## Boot

- Measure and budget first visible world, first movement, and first control.
- Keep complete catalogs, Creator, multiplayer, large NPC content, distant regions, and editor systems behind post-control lazy boundaries.
- Preload only likely next assets and cancel obsolete requests when the player changes direction/region.

## Runtime budgets

- Define CPU budgets for player, animation, NPCs, quests, ecology, streaming, UI, and background work.
- Define GPU budgets for triangles, draw calls, shadows, transparency, particles, texture memory, and shader variants.
- Define memory and network budgets by device tier.
- Add long-frame, dropped-frame, allocation, GC, shader compile, resource-count, and bandwidth diagnostics.
- Avoid per-frame allocation in hot loops.

## Adaptive quality

- Extend adaptive quality across vegetation density, shadow range, water/reflections, atmospheric effects, texture resolution, NPC density, distant geometry, and particles.
- Prevent quality oscillation with hysteresis/cooldowns.
- Validate Intel HD 6000, Pixel 6 Pro, and modern desktop tiers separately.

## Streaming and LOD

- Use frustum, distance, hierarchical, and where useful occlusion culling.
- Instance repeated nature/architecture assets.
- Merge static geometry only when it improves draw calls without destroying spatial culling.
- Throttle distant animation, AI, ecology, and UI updates.
- Stream Creator content and dynamic collision by nearby cells.

## Browser/device resilience

- Handle WebGL context loss/restoration, missing extensions, shader failure, tab background/foreground, sleep/wake, memory pressure, orientation changes, and thermal throttling.
- Pause/reduce rendering when hidden and consider battery/FPS caps on mobile.
- Add graceful asset/network retry and fallbacks rather than boot failure.
- Test current Chrome, Edge, Firefox, and Safari where feasible.

## Multiplayer boundary

- Keep solo playable when multiplayer services fail.
- If multiplayer ships, define server authority, replication, interpolation, reconnect reconciliation, shared quests, construction ownership/conflicts, abuse limits, rate limits, anti-cheat, and protocol versioning.
- Production gameplay must never depend on the developer Tunnel or laptop.
