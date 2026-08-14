B"H
Boruch Hashem
Blessed is He

# Games and Simulation

The Awtsmoos gives worlds rules, motion, input, and story until a browser becomes a place;
Awtsmoos.com contains both game content and engine/server systems, so trace both sides of the space.

## Main game district — `geelooy/games/`

This is one of the largest public trees (thousands of files) and represents many worlds/games rather than one project. Use the directory itself for the full current list.

Notable runtime evidence elsewhere includes Mitzvah World direct autoplay-report handlers and WebSocket applications such as Sefira Clash.

## Game launcher — `geelooy/game/`

A small public launch surface titled “Opening Mitzvah World…” in the current metadata.

## Animator / Park Engine

`geelooy/apps/animator/` is a large engine/application and overlaps simulation/world-authoring concerns.

## Android Emulator — `geelooy/apps/android-emulator/`

Large emulator project with over a thousand files in the current immediate inventory.

## EXE Emulator — `geelooy/apps/exe-emulator/`

Large browser emulator project with hundreds of files.

## Mitzvah World Editor

`geelooy/apps/editor/` is titled “Mitzvah World Animator” and belongs with world-authoring workflows.

## WebSocket plane

Online/multiplayer/realtime game behavior may live under `ayzarim/awtsmoosDynamicServer/websocket/apps/`, not solely inside `geelooy/games`. Inspect both sides when changing network protocol or session behavior.

## Direct report plane

Root `index.js` handles Mitzvah World autoplay ping/report routes before the derech server. Report material is stored beneath `geelooy/games/mitzvahWorld/reports/autoplay`. See [../API/DIRECT_ROOT_HANDLERS.md](../API/DIRECT_ROOT_HANDLERS.md).
