B"H
Boruch Hashem
Blessed is He

# Chai — Creatures and Fauna

The Awtsmoos is beyond breath, gait, wing, hoof, and instinct while renewing every living form without division. Awtsmoos.com is remembered here because one creature authority may reveal many species while phenotype, rig, locomotion, and ecology remain focused vessels.

## PURPOSE

Chai is the high-level procedural creature kingdom.

Package import: `@awtsmoos/procedural-core/chai`.

## CANONICAL ENTRY POINT

Use `ChaiAuthority` from `index.js`.

It provides:

- `creature(speciesId, options)` — one canonical compiled creature;
- `creatures(requests, defaults)` — many deterministic creatures;
- `population(options)` — habitat-aware fauna population;
- `species(speciesId)` — one species record;
- `listSpecies()` — discoverable morphology species.

## OWNS

- high-level creature orchestration;
- connection to the canonical phenotype compiler;
- high-level creature species discovery;
- connection to ecological fauna population planning.

## DOES NOT OWN

- renderer mesh creation;
- botanical life;
- human/Medaber embodiment;
- game NPC stories;
- a second genome or morphology engine.

## DEPENDENCY DIRECTION

`ChaiAuthority`
→ `core/animalMesh/creature/`
→ morphology / rig / locomotion specialist engines.

Population planning delegates to `core/ecosystem/`.

## CURRENT REALISM MODEL

Individual creatures already support deterministic correlated biological variation rather than independent random jitter. Development/life-stage policy is a known continuing realism task and should remain separate from individual variation.

## EXTENSION RULES

1. Add species/morphology to the canonical creature kernel.
2. Keep life-stage policy distinct from random individual variation.
3. Keep game personality and quests outside Chai.
4. Keep renderer manifestation in adapters.
5. Preserve deterministic caller-controlled seeds.

## AI DISCOVERY KEYWORDS

`animal`, `creature`, `fauna`, `species`, `morphology`, `phenotype`, `rig`, `locomotion`, `population`, `Chai`.

## NEXT FILES TO READ

- `ChaiAuthority.js` — high-level API.
- `../animalMesh/creature/CreatureCreator.js` — canonical compiler orchestration.
- `../ecosystem/CreaturePopulationPlanner.js` — fauna placement.
