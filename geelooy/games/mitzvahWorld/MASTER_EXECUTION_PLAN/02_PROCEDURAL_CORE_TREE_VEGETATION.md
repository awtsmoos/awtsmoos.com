B"H
Boruch Hashem
Blessed be He

# 02 — Procedural Core Tree, Vegetation, Botany, Ecology

## Architectural laws
- [ ] `awtsmoos-procedural-core` contains zero THREE.js-specific implementation, imports, DOM assumptions, WebGL objects, or renderer classes.
- [ ] Move all THREE adapters into an external renderer-integration package; migrate consumers before deleting compatibility paths.
- [ ] Core outputs only portable data: positions, normals, UVs, indices, material roles, texture identities, instances, skeletons, collision intent, animation/deformation state, semantic metadata, simulation state.
- [ ] Core must import in plain Node and Workers without `window`, `document`, `Image`, THREE, WebGL, or network access.
- [ ] Add CI scans/tests that fail on forbidden renderer references.

## EZ-Tree 2.0 strict-superset gate
Maintain a checked-in parity matrix mapping each upstream feature to Awtsmoos implementation + regression test.
- [ ] seeded deterministic generation;
- [ ] recursive branching, taper, twist, gnarliness;
- [ ] global growth force and trellis attraction;
- [ ] stratified longitudinal attachments + independently permuted radial slots;
- [ ] attachment interpolation between real branch nodes;
- [ ] radius-aware bark UVs and physical bark repeat scale;
- [ ] single/double billboard foliage and rounded foliage normals;
- [ ] same-skeleton multi-LOD with radial/longitudinal/leaf/twig controls;
- [ ] raw renderer-neutral geometry;
- [ ] caller-supplied abstract PBR/material identities;
- [ ] wind behavior surpassed by renderer-neutral hierarchical dynamics.
## Canonical tree authority
- [ ] Collapse duplicate tree paths into one flow: species → environment → biology → canonical skeleton → roots → twigs → reproductive organs → foliage → geometry → materials → wind → LOD → instances/streaming.
- [ ] Separate species identity, preset/style, age, environment, management, and quality budget.
- [ ] Keep RNG domains independent for trunk, major branches, twigs, leaves, flowers, fruit, roots, bark variation, deadwood, wind, seasons, damage, and ecology.
- [ ] Changing textures, season, wind, or graphics quality must not alter structural identity.
- [ ] Stable skeleton hashes across LODs and reloads.
- [ ] Resource budgets must degrade gracefully rather than delete foliage or violate pipe-model conservation.

## Branch and crown biology
- [ ] apical dominance, internodes, lateral/terminal buds, species branch whorls, phyllotaxis;
- [ ] age-specific branch order, lower-branch shedding, self-thinning, crown retrenchment;
- [ ] light-seeking growth, self-shading avoidance, canopy-gap filling, crown collision avoidance;
- [ ] obstacle/building avoidance, prevailing-wind asymmetry, slope response, tree lean;
- [ ] allometry between height, trunk diameter, crown radius, branch radius, leaf area, roots, and biomass;
- [ ] pipe-model conductive area, sapwood/heartwood intent, branch collars, junction swelling, butt flare;
- [ ] hero-quality blended/welded branch junctions rather than visibly glued cylinders.

## Fine morphology
- [ ] broadleaf hierarchy: trunk → limb → branch → fine twig → petiole → individual leaf;
- [ ] compound leaves: pinnate, bipinnate, palmate, opposite/alternate/whorled placement;
- [ ] petioles, leaf curvature/cupping/twist, front/back material intent, transmission, midrib/edge wind weights;
- [ ] pine branch whorls → shoots → needle fascicles/clusters;
- [ ] cedar/cypress flattened sprays/scale foliage;
- [ ] palm trunk → crown → frond rachis → leaflet behavior;
- [ ] willow hanging flexible terminal twigs;
- [ ] mangrove prop roots/pneumatophores; baobab massive trunk/sparse limbs; redwood vertical dominance.
## Flowers, fruit, lifecycle, damage
- [ ] Replace placeholders with parameterized buds, sepals, petals, centers, stamens/pistils where useful, stems, fruit, pods, nuts, cones.
- [ ] Flower controls: petal count/shape/curve/rotation/color, center, orientation, clustering; support solitary/raceme/panicle/umbel/spike/catkin.
- [ ] Lifecycle: dormant bud → swelling/opening → leaf/flower → pollinated → immature fruit → mature fruit → dropped fruit/seed.
- [ ] Fruit/cones attach to real twigs and can influence branch deformation at hero quality.
- [ ] Seasons: leaf-out, mature, autumn, senescence, fall, bare winter; evergreens get new shoots/annual shedding/snow loading.
- [ ] Persistent damage: pruning, broken branches, scars, lightning, fire, wounds, deadwood, snags, cavities, fallen logs, stumps, growth rings.
- [ ] Growth stages: sapling, young, mature, ancient, decline, dead; preserve tree lineage across years.

## Roots and environment
- [ ] Root architectures: taproot, fibrous, shallow radial, buttress, prop-root; roots follow soil/slope, avoid rock/foundations, seek moisture.
- [ ] Root/trunk ground blending and exposed roots near erosion.
- [ ] Soil fields: moisture, organic matter, pH, drainage, depth, rockiness, temperature, salinity.
- [ ] Light, water, temperature, elevation, slope/aspect, wind exposure, flooding, drought, snow, fire, grazing, and human management alter phenotype.
- [ ] Crown and root competition fields; sapling recruitment and carrying capacity.
- [ ] Succession: disturbance → pioneers → young woodland → mature forest → old growth; age cohorts and edge ecology.

## Species asset authority
- [ ] Your exact transparent per-species leaf is hero/high-detail authority.
- [ ] Generated 1024/512/256 derivatives are standard LOD sources; old Chai/EZ aggregate cards become lower-LOD/fallback assets.
- [ ] Exact bark → evidenced PBR bark family → morphology fallback → neutral procedural fallback. Never silently fake species identity.
- [ ] Publish/version `tree-species.json` with aliases, morphology, leaf/bark/PBR assets, alpha state, resolution, provenance, LODs, fallback confidence.
- [ ] Remaining known true gaps: cedar bark, maple bark, proper cherry/sakura leaf + bark.
- [ ] Alpha-safe mipmaps/edge dilation/coverage preservation; verify no white halos or clipped stems.

## Forest scale
- [ ] Instance batching by species/LOD/material/archetype; cache structural archetypes and shared geometry.
- [ ] LOD hierarchy: hero tree → simplified tree → tree impostor → forest cluster → canopy mass → regional statistical cover.
- [ ] Hysteresis/crossfade intent, canopy projected-area preservation, alpha-overdraw budgets, texture/material LOD.
- [ ] Near trees simulated individually; mid-distance cohorts; far forest statistics. Promote/demote without changing identity.
- [ ] Worker generation, cancellation, transferable arrays, deterministic cell seeds, cell-border consistency.
- [ ] Performance, fuzz, determinism, memory, topology, material, and species-gallery tests are release gates.