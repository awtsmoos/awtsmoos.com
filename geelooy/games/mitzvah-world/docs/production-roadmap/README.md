B"H

# MitzvahWorld Production Roadmap

This directory is the durable engineering record for the production-scale ideas gathered during the September 2026 completion push.

The governing target is a living Jewish civilization simulator with immediate play, cinematic realism, persistent consequences, and reusable world intelligence owned by Awtsmoos Procedural Core.

## Non-negotiable laws

- FPS always wins; realism should come from simulation, good materials, instancing, lighting, and hierarchy rather than brute force.
- First frame must become visible before enrichment; first control must never wait for optional systems.
- MitzvahWorld should define this world while reusable terrain, water, architecture, ecology, materials, placement, collision, and streaming move toward Procedural Core.
- Remote assets are authoritative; exact byte identity is SHA-256, aliases do not create duplicate runtime resources.
- Pure base materials stay pure; wetness, dirt, snow, moss, wear, transitions, and combinations belong to procedural layering.
- Gameplay state has one authority per domain; rewards and construction must be idempotent and transactional.
- Every touched authored source file stays readable, documented, tab-indented, non-minified, and at or below 120 lines.
- Generated compact bundles are never hand edited.
- Concurrent work is preserved; stage only owned paths.

## Roadmap modules

- `01-assets-materials.md` — ingestion, semantics, PBR, publication, caching, provenance.
- `02-world-simulation.md` — terrain, hydrology, biomes, architecture, interiors, ecology, weather.
- `03-gameplay-content.md` — quests, Bridge Trial, Creator, Torah/mitzvah loops, persistence.
- `04-character-npcs-ui.md` — player, traversal, NPC civilization, camera, mobile, accessibility.
- `05-performance-platform.md` — streaming, LOD, budgets, browser/device resilience, multiplayer boundaries.
- `06-production-operations.md` — security, observability, capacity, deployment, backup, privacy.
- `07-testing-release.md` — automated gates, visual acceptance, RC and rollout.
- `08-long-horizon.md` — data-driven expansion, tooling, content operations, future platform evolution.
