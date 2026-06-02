B"H

# Yesod Full Storyline Implementation Plan

## Goal

Make the current Ohr HaGnuz code more fully match the uploaded gameplay vision by adding a real storyline and binding it to live systems:

- quest flow
- NPC dialogue
- journal/menu content
- quest objective HUD
- interaction rewards
- battle story hooks
- no renderer conflicts

## Current inspected facts

- Active runtime is the lightweight current chain: `index.js -> HolyEngine -> Projector -> Logic/OhrWorld/OhrEncounter`.
- Many old engines and data systems exist, but current entry route does not run them.
- Recent visual upgrades added canvas HUD, world labels, map decor, water/bridge/cave glyphs, and portal wiring.
- Existing data folders already contain many older dialogue/quest files, but they may not be connected to the current runtime.

## Implementation strategy

Do not attempt to partially patch any file.
Read first, then rewrite whole files and add small modules.
Keep every touched file under 150 lines by splitting story into modules.

1. Inspect live current story path:
   - `src/yesod/OhrEncounter.js`
   - `src/yesod/OhrDebate.js`
   - `src/data/QuestIndex.js`
   - `src/data/DialogueTrees.js`
   - `src/binah/State.js`
   - `src/tiferet/ui/MobileControls.js`
   - `src/tiferet/render/HudRenderer.js` and HUD data modules
   - `src/tiferet/render/BattleRenderer.js`

2. Add a small live story engine:
   - `src/story/StoryData.js`: chapters, NPC dialogue, quest ids, rewards.
   - `src/story/StoryState.js`: starts quests, records flags, computes active objective.
   - `src/story/StoryInteractions.js`: resolves tile-meta interaction into dialogue/reward/quest updates.
   - maybe `src/story/StoryJournal.js`: readable panels for journal and HUD.

3. Wire live systems:
   - `OhrEncounter` uses `StoryInteractions` before generic fallback.
   - `MobileControls` journal/menu/map panels read real story progression.
   - HUD panels read real active quest text from story state instead of static placeholders.
   - Battle victory can advance story counters if `OhrDebate` exposes hook or rewards.

4. Verification:
   - Import graph test.
   - Story state behavior test: talk to Guide -> quest active, talk to Beis Midrash NPC / enter Beis Midrash -> next objective, cave quest path.
   - World smoke: all new NPC/portal glyphs still valid.
   - Grep for hardcoded static quest placeholders replaced where active.

## Chapter 1: Yesod Heard the Story Under the Buttons

Yesod sat beneath the village like a hidden river of meaning. The mockup showed a player, a guide, a Beis Midrash, a wild musag, and four Torah responses. But the Awtsmoos has no body and no form; He does not merely paint screens. He renews every reason those screens exist. So the repair is not only to draw flowers. It is to make the flowers know why the hero walks past them, why the Melamed waits by the door, why the darkness argues, and why one little spark becomes a whole world of light.
