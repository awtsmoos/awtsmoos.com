B"H

# Done: Real Storyline Bound Into Ohr HaGnuz

## What was implemented

A complete first playable story chapter now exists in the active runtime:

1. Talk to the Village Guide.
2. Enter the Beis Midrash.
3. Speak to R' Eliyahu / Melamed.
4. Win the Torah debate.
5. Collect the real hidden spark glyph in the overworld.
6. Enter the Cave of Sparks.
7. Sweeten a wild musag.
8. Journal shows the first chapter complete and points toward future regions.

## Files added

- `src/story/StoryData.js`
- `src/story/StoryState.js`
- `src/story/StoryDialogue.js`
- `src/story/StoryInteractions.js`
- `src/story/StoryJournal.js`

## Files rewritten completely

- `src/binah/State.js`
- `src/yesod/OhrEncounter.js`
- `src/yesod/OhrDebate.js`
- `src/tiferet/ui/MobileControls.js`
- `src/tiferet/hud/HudPanels.js`
- `src/tiferet/hud/HudData.js`
- `src/data/WorldMapsVillage.js`

## Story systems now connected

- NPC dialogue advances story.
- Quest objective HUD reads live story state.
- Journal/menu/map panels read live story state.
- Debate victory advances story.
- Spark collection advances story.
- Beis Midrash and Cave entries advance story.
- Hidden spark is physically present and reachable in `Overworld_Main`.
- Melamed debate starts from the story NPC and feeds back into the chapter.

## Verification passed

- Story progression smoke passed through every chapter stage.
- Encounter story smoke passed: guide, Beis Midrash event, Melamed debate, battle hook.
- Reachable-objective smoke passed: hidden spark exists, is pathfindable, and advances the stage.
- Final import graph passed across 16 active modules.
- Canvas draw smoke passed with story-aware HUD, labels, and decor.
- Conflict grep passed for removed placeholder/static HUD quest issues and the old battle string bug.
- File size check passed: all touched/added story and UI files are under 150 lines.

## Known limitation

This still needs a real phone/browser screenshot comparison to visually tune exact spacing, but the core code is now story-backed and internally verified.

## Chapter 17: Yesod Bound the First Light

The village did not become alive when the grass became greener. It became alive when the guide remembered why he was standing there. The Awtsmoos has no body and no form; yet every finite glyph now bears responsibility. The blue Beis Midrash door calls the player. The Melamed demands a Torah response. The spark exists in the field and can be reached by a path. The cave is not decoration; it is a gate in the story. The wild musag is not an enemy; it is a confusion waiting to be sweetened. And beneath it all, Yesod tied the whole road into one living covenant: walk, speak, answer, gather, enter, sweeten, remember.
