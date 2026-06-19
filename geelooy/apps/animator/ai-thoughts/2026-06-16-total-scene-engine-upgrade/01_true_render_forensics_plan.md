B"H

# Total Scene + Engine Upgrade: Forensics Plan

The screenshots prove the healthy-lunch scene data did not conquer the actual canvas. The old city skyline, black band, building layer, and mobile timeline still rule. The work now is not a tiny scene edit. It is a real engine upgrade: find the true render chain, create a stage-first scene engine, and force the default path to render a new complete cartoon scene.

## Phase 1: Find the real canvas chain

Search every file for:
- `SceneRenderer.render`
- `BuildingGenerator`
- `MountainGenerator`
- `FoliageGenerator`
- `PropManager.render`
- `CharacterRenderer`
- `ctx.fillRect`
- black ground colors
- canvas transforms
- default scene installer

## Phase 2: Build a production stage override

A new `ProductionStageRenderer` will draw a full kitchen/lunch stage in the same coordinate system used by the actual app. If needed, we will wire it directly into the real render manager, not the guessed manager.

## Phase 3: Upgrade data and runtime

The new scene should contain a coherent world:
- warm kitchen wall
- window, shelves, table, plate, lunchbox
- kid and guide standing behind/near table
- food props behaving like characters
- no skyline
- no black void
- no rooftop ground

## Phase 4: Verify

Run import graph, syntax, scene smoke, and HTTP check. Add runtime breadcrumbs so the console proves which scene style is active.
