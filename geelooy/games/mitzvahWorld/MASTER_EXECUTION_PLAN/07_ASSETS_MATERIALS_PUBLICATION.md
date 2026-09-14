B"H
Boruch Hashem
Blessed be He

# 07 — Assets, Materials, Semantic Catalog, Publication

## Current local asset context to verify
- Previous local catalog had expanded beyond the live production catalog; never assume local counts are live.
- A newer 50-texture batch was imported locally and semantically renamed with provenance.
- Transparent tree foliage sources/LODs were recovered/generated locally; live publication still requires explicit verification.
- Re-check all counts/hashes before reporting.

## Asset authority
- [ ] one universal importer for textures, PBR families, models, HDR/environment assets, audio, and future formats;
- [ ] provenance: original source, license, hash, dimensions, transforms, derivatives, import time, semantic identity;
- [ ] immutable physical bytes addressed by content hash where practical;
- [ ] mutable semantic catalogs published only after immutable bytes exist;
- [ ] exact asset role: canonical source, derivative, fallback, legacy alias;
- [ ] dedupe physical bytes without destroying semantic aliases.

## Semantic discovery
- [ ] categories, overlapping subcategories, traits, labels, scientific/common synonyms, use-intent labels;
- [ ] phrase/word matching avoids substring bugs (`tin` in keratin, `ice` in pumice, `fur` in sulfur);
- [ ] explainable ranking for AI/humans; return why a material matched;
- [ ] morphology/use queries such as wet rock, alpine bark, short-pile carpet, mineral fiber, riparian plant;
- [ ] quality/resolution/alpha/PBR-channel facets;
- [ ] compatibility aliases preserved when taxonomy evolves.

## Material synthesis over duplication
- [ ] prefer procedural recolor, wetness, roughness, moss, lichen, dirt, age, burn, snow, frost, stains, edge wear, decals over thousands of near-duplicate textures;
- [ ] recipes are reproducible source asset + masks/transforms + runtime state;
- [ ] material provenance chain remains inspectable through composition;
- [ ] cache identical composites and avoid permanent colorized duplicates.
## Tree/botany asset specifics
- [ ] exact per-species leaf/bark registry, high-res transparent source + standardized 1024/512/256 derivatives;
- [ ] Chai/EZ aggregate foliage retained as lower-LOD optimization/fallback, not hero species authority;
- [ ] alpha QA: border removal, halo/fringe, fine stems, alpha coverage, crop bounds, color contamination;
- [ ] alpha-safe mipmaps/edge-color dilation/premultiplication policy;
- [ ] `tree-species.json` public/versioned with species aliases, morphology, LOD assets, PBR family, fallback confidence, provenance;
- [ ] remove obsolete Firebase host references after self-hosted Awtsmoos publication is proven.

## Publication workflow
1. [ ] Inspect existing migration/Dayuh importer and current public topology.
2. [ ] Dry-run exact local public-tree/catalog mutations.
3. [ ] Verify no unrelated Dayuh data is included.
4. [ ] Publish/add immutable bytes first; never destructive-delete by default.
5. [ ] Publish generated derivatives.
6. [ ] Publish mutable catalogs/index/taxonomy last.
7. [ ] Verify live GET status, MIME, CORS, cache headers, byte size, dimensions, representative SHA-256.
8. [ ] Compare live catalog counts/index counts against local expected counts.
9. [ ] Test representative semantic queries against live data.
10. [ ] Record publication receipt/version/build provenance.

## CDN / reliability
- [ ] immutable cacheable asset URLs and versioned catalog invalidation;
- [ ] request dedupe/coalescing; prioritize visible/high-value assets;
- [ ] memory-aware texture residency and progressive resolution promotion/downshift;
- [ ] missing asset fallback must look deliberate and never crash generation;
- [ ] asset-server outage test: structural world generation remains functional.

## Security / licensing
- [ ] never publish secrets/tokens in manifests/logs;
- [ ] maintain license/attribution/commercial-use evidence where applicable;
- [ ] validate untrusted asset metadata and file bounds before ingestion.