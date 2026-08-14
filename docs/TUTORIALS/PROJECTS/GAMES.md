B"H
Boruch Hashem
Blessed is He

# Games and Worlds

Game boundaries under `geelooy/games/` can contain standalone browser experiences, shared game infrastructure, realtime integrations, assets, simulations, and specialized reports.

## Investigate a game

1. Identify the game project boundary rather than shared `games/scripts`, `styles`, or `tests` roots.
2. Open observed public entry URLs and source entry files.
3. Check imports into shared game/browser libraries.
4. Check generated WebSocket application/event evidence when the game is realtime.
5. Inspect direct root handlers when a game has specialized server reporting, such as Mitzvah World.

## Caveats

An HTML entry does not prove server/realtime readiness. Asset volume does not measure architectural importance. Generated dependency edges are lexical. Shared game infrastructure should not be documented as if it were one game product.
