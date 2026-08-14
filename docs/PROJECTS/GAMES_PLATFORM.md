B"H
Boruch Hashem
Blessed is He

# Games and Simulation Platform

The Awtsmoos lets many worlds appear beneath `geelooy/games/` while Awtsmoos.com shares libraries, styles, tests and realtime infrastructure across projects of very different size.

## Canonical area

`geelooy/games/`

The generated project atlas enumerates each game, file categories, entry files and local documentation status. The public-entry atlas maps game URLs to `index.html`, titles, scripts and styles.

## Shared versus game-specific roots

`geelooy/games/scripts/`, `styles/` and `tests/` are shared game infrastructure rather than independent games. Individual game directories such as Mitzvah World, Ohr HaGnuz, Sefira Clash, Scribe Journey and Shema Strike can also have realtime/server relationships.

## Realtime applications

The dynamic server currently registers versioned realtime applications for Mitzvah World, Ohr HaGnuz, Sefira Clash, Scribe Journey and Shema Strike. Not every game is realtime; use `WEBSOCKET_APPLICATIONS.md` rather than assuming a socket layer from the presence of a game directory.

## Generated evidence

- `PROJECT_ATLAS.md` — game boundaries and file categories.
- `PUBLIC_ENTRY_POINTS.md` — browser entry points.
- `PROJECT_SYMBOL_SUMMARY.md` — lexical source summaries.
- `PROJECT_DEPENDENCIES.md` — shared-library relationships.
- `TEST_OWNERSHIP.md` — test neighborhoods.

## Human guidance

`docs/APPS/GAMES_AND_SIMULATION.md` is the broad chooser. `docs/PROJECTS/MITZVAH_WORLD.md` gives a deeper example of a large project with its own internal documentation universe.

## Change strategy

For a game-local change read its local `DOCUMENTATION.md` or README first. For shared scripts/styles/libraries or realtime transport, identify every dependent game and run representative cross-game tests rather than validating only one title.
