B"H

# Assets and Materials

## Immediate publication

- Publish the 56 newly imported source textures plus half/quarter derivatives through the canonical self-hosted Drive migration lane.
- Publish refreshed `materials.json`, `asset-inventory.json`, `material-ai-index.json`, `material-taxonomy.json`, and provenance metadata.
- Upload immutable bytes first, verify hashes, then publish mutable catalogs last.
- Keep prior catalog generations available for rollback and older cached clients.
- Verify public SHA-256, byte count, MIME, CORS, cache policy, dimensions, and representative full/half/quarter variants.

## Ingestion

- Keep import dry-run by default and idempotent.
- Recursively support images, GLB/GLTF, HDR/EXR, KTX/KTX2, audio, and safe archive ingestion.
- Reject zip-slip, decompression bombs, corrupt media, suspicious dimensions, and unsupported formats.
- Detect exact duplicate bytes independent of filenames.
- Canonicalize collisions without overwriting distinct assets.
- Preserve source descriptions, license, creator, origin, generation batch, and review state without leaking local paths.
- Flag non-square material images, obvious collages, borders, baked directional light, watermarks, and weak seamlessness.
- Review the current seven non-square newly generated textures explicitly.

## AI discovery

- Maintain overlapping semantics: substance, origin, use, physical traits, PBR channel, environment, and application.
- Add synonyms and ontology relations without multiplying physical identities.
- Distinguish filename evidence, explicit metadata, family inheritance, and heuristic inference.
- Add confidence/evidence to search results.
- Add negative rules for ambiguous language such as rough-cut versus roughness and waterfall-rock versus water.
- Search by intent such as roof, wall, riverbank, upholstery, paving, cliff, garden, or interior surface.
- Keep substance distinct from use so one limestone source can satisfy terrain and architecture.
- Expose real-world scale, recommended meters-per-repeat, and directional grain.
- Expose PBR completeness and normal-map convention.
- Rank by semantic fit, available channels, resolution, cost, and quality budget.

## Runtime materials

- Deduplicate decoded images and GPU textures by hash.
- Add budgeted LRU eviction and progressive low-to-high hydration.
- Never block first control on the full catalog.
- Add material-intent APIs to Procedural Core rather than filename lookups in games.
- Generate tint, UV variation, macro noise, roughness variation, dirt, snow, moss, wetness, wear, traffic, decals, and shoreline effects procedurally.
- Add physically meaningful wetness, frost/snow accumulation, dust, stains, and traffic wear.
- Add GPU-friendly KTX2/Basis/WebP/AVIF derivatives only after color-space and normal-map validation.
- Preserve original source bytes permanently even when optimized derivatives are added.
