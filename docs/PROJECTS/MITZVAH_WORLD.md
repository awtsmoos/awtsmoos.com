B"H
Boruch Hashem
Blessed is He

# Mitzvah World

The Awtsmoos lets a browser project become a world of assets, scenes, movies, experiments, shared systems and realtime behavior; Awtsmoos.com treats Mitzvah World as a major project rather than a single game page.

## Canonical source

`geelooy/games/mitzvahWorld/`

The observed root contains `assets/`, `docs/`, `experiments/`, `movies/`, `proof/`, `references/`, `shared/`, `styles/`, AI/evidence directories, an `index.html`, and multiple project audit/index documents. It also carries an external-assets link.

## Existing in-project documentation

Before changing a major subsystem, inspect project-local documents such as:

- `DIRECTORY_GUIDE.md`
- `DIRECTORY_INDEX.md`
- `DIRECTORY_CATALOG.json`
- `SYSTEM_OVERLAP_MAP.md`
- `NEXT_AI_README.md`
- `REMAINING_WORK.md`
- focused audit documents for movie/procedural systems

These are project-specific evidence and should be preserved rather than replaced by central generic docs.

## Surrounding runtime systems

Mitzvah World is not isolated to static game files:

- root `index.js` contains direct autoplay ping/report handlers associated with Mitzvah World;
- report material is written beneath the Mitzvah World tree;
- the dynamic server has a registered realtime application with ID `mitzvah-world` version 1;
- generated dependency evidence shows the project importing shared libraries heavily;
- generated test ownership identifies this as one of the largest test neighborhoods in the repository.

## Human documentation

- `docs/APPS/GAMES_AND_SIMULATION.md`
- `docs/API/DIRECT_ROOT_HANDLERS.md`
- `docs/WEBSOCKETS/APPLICATIONS.md`
- generated `PROJECT_ATLAS`, `PROJECT_SYMBOL_SUMMARY`, `PROJECT_DEPENDENCIES`, `TEST_OWNERSHIP`

## Change strategy

A scene/asset/editor change may be browser-only, but engine/shared/realtime/report changes can cross project boundaries. Begin from the local directory maps, trace imports/callers, identify whether WebSocket or root-direct server behavior participates, then run the nearest focused tests plus relevant game/runtime regression tests.

## Documentation boundary

Central docs explain how Mitzvah World relates to the repository. The project's own directory guides remain the detailed internal map. Do not duplicate their entire subsystem catalog centrally.
