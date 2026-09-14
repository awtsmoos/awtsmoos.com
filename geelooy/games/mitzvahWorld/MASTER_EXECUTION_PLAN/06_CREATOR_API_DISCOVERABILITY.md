B"H
Boruch Hashem
Blessed be He

# 06 — Creator, Public API, Discoverability, AI Authoring

## Public API north star
A developer should type `Awtsmoos.` and immediately discover coherent domains: `world`, `terrain`, `weather`, `water`, `vegetation`, `civilization`, `creator`, `assets`, `quests`, `audio`, `physics`, `query`, `events`, `save`, `performance`, `debug`.

## Three API layers
- [ ] Intent layer: high-level operations like create village, grow forest, add river, make thunderstorm.
- [ ] Domain layer: explicit terrain/weather/tree/city configurations.
- [ ] Primitive layer: geometry, fields, sampling, transactions, typed arrays, low-level portable data.
- [ ] Convenience APIs must wrap canonical authority, never duplicate it.

## Discoverability
- [ ] searchable capability registry with synonyms/aliases (`river`, `stream`, `hydrology`, `waterway`);
- [ ] `Awtsmoos.capabilities()` exposes what this exact build supports;
- [ ] source-generated docs from real contracts/JSDoc/schema metadata;
- [ ] every public API has tiny, real-world, and advanced examples;
- [ ] API breadcrumbs/relationship graph, e.g. Awtsmoos → world → vegetation → trees → species → materials;
- [ ] dependency/performance/quality metadata for each capability;
- [ ] command palette searches capabilities by user intent, not file names;
- [ ] interactive API explorer in Creator with safe execution against current world;
- [ ] `Explain this object` shows stable ID, API/generator, seed, inputs, provenance, LOD, persistence, material fallback;
- [ ] `Show underlying API` for every Creator operation.
## Creator UX
- [ ] layers for terrain, water, roads, structures, vegetation, NPCs, weather, quests, decoration;
- [ ] multi-select, duplicate, transform, snapping, collision warnings, terrain conformity, rotation/elevation;
- [ ] full transactional undo/redo; preview before commit; failed procedural operations roll back cleanly;
- [ ] procedural brushes: olive orchard, riparian willow grove, forest edge, weather region, road/path, river, settlement district;
- [ ] paint fields/intent rather than thousands of objects when possible;
- [ ] pin/author landmark objects while surrounding systems stay procedural;
- [ ] Creator edits become sparse overrides/deltas over procedural baseline;
- [ ] phone-width usability and contextual panels; no desktop-only control assumptions;
- [ ] Creator can switch to Play without rebuilding the entire world.

## Query / events / transactions
- [ ] one indexed semantic world-query API: nearest fruiting olive, buildings near water, residents of district, waterfalls in radius;
- [ ] one versioned event vocabulary with schemas;
- [ ] one transaction authority for builds, inventory, quests, world edits, ownership;
- [ ] every meaningful transaction has stable ID/idempotency key and exact-once semantics;
- [ ] APIs return explanation receipts: selected assets, rules, fallbacks, costs, changed IDs.

## AI authoring
- [ ] AI requests semantic intent/schema data, not arbitrary executable source;
- [ ] validate every AI-authored recipe and clamp resource budgets;
- [ ] AI searches existing assets/materials before requesting generation;
- [ ] AI can ask `make this valley greener but preserve village/river` and receive a deterministic edit plan;
- [ ] AI reports estimated cost/performance before applying expensive changes;
- [ ] AI can explain why an asset/species/API was selected and fallback confidence;
- [ ] recipes can be saved/reused/shared; record a Creator operation and export equivalent API recipe.

## API stability
- [ ] version public schemas/contracts;
- [ ] deprecation period + migration helpers;
- [ ] contract tests for deterministic result shape, validation, compatibility, no unbounded allocation;
- [ ] human-readable errors; no raw stack-trace UX for normal validation failures.