B"H

# Hod Polish Plan: Smooth Feet, Clear Story, Working Buttons

## Inspected truth
- Runtime root is connected and writable.
- The game is in `geelooy/games/ohr-hagnuz`.
- `State.Speed` was lowered to 4, but `PlayerPose.walkCycle()` was still using `tick / 16`, so with `stepTick += 4` it jumped through 90-degree phases and looked choppy.
- `OhrEncounter.handleActionFacing()` has no final fallback, so Talk / Interact can appear dead when the front tile is ordinary road or grass.
- Overworld begins at hero tile 12,7 with road nearby. Adding a guide glyph beside the hero in `WorldMapsVillage.js` can make the story immediately clear.
- Story strings exist but are random and not a clear first dialogue chain.

## Full-file rewrite plan
1. Rewrite `State.js` with a small story progression record, a smoother Speed value, and a method to advance story beats.
2. Rewrite `PlayerPose.js` so the animation phase spans a full 64px tile stride, not 16 ticks.
3. Rewrite `WorldMapsVillage.js` to place the Village Guide next to the starting hero.
4. Rewrite `StoryIndex.js` to give the Village Guide clear sequential story beats.
5. Rewrite `OhrStory.js` to advance sequentially for the Village Guide instead of random-only.
6. Rewrite `OhrEncounter.js` to give Talk/Interact a clear fallback response and keep all button actions visible.
7. If needed, rewrite `MobileControls.js` so all panel/action buttons declare visible behavior, including battle items.

## Verification
- Node import smoke for State, StoryIndex, OhrStory, PlayerPose.
- Behavioral smoke: first guide story advances line 1 then line 2; walkCycle has many smooth phase samples; action fallback is importable.

Chapter 2: Hod entered the village road and heard the player’s complaint like stone scraping glass. The Awtsmoos was not in the complaint as anger, but as the demand that the vessel become honest. The guide must stand beside the hero. The buttons must speak. The stride must stop shattering into jagged sparks and begin flowing like dust under living feet.
