B"H

# Specific Write Plan

## Finding

The default scene index exports `DEFAULT_LIVING_SCENE`, but the director panel imports `DefaultSceneEpic.js` directly. Therefore the visible PLAY_DEFAULT_SCENE button may still launch the older packed epic instead of the newer living scene. To truthfully make default updated, the panel import must use the default index.

## Files to rewrite whole

1. `src/data/scenes/default/dialogueBeats.js`
   - Expand from 7 beats to a richer 14-beat scene.
   - Add autoShot, shotIntent, targets, movementIntent, angleIntent.
   - Add emotions/moments for facial expression variety.
   - Add listener reaction actorActions between lines.
   - Add object inserts and prop actions.

2. `src/data/scenes/default/cameraRigs.js`
   - Add better named fallback rigs: establishing, face closeups, prop inserts, hands, reaction, group, overhead-ish detail.

3. `src/data/scenes/default/DefaultLivingScene.js`
   - Add more environmental props: bench, sign, flower, lunch cloth, sparkles, crumbs, bottle, notebook.
   - Add expressionProfile to all characters.
   - Increase duration.
   - Preserve existing character ids.

4. `src/performance/face/EmotionLibrary.js`
   - Add more face poses for skeptical, proud, shy, relieved, delighted, determined, playful, amazed.

5. `src/ui/components/editor/panels/director/Panel.js`
   - Import from `data/scenes/default/index.js` so PLAY_DEFAULT_SCENE uses the updated living default.

6. Add/adjust verify smoke if needed.

## Verification

Run `npm run verify:fast`, `npm run verify:healthy`, `npm run verify:shot-suite`, and full `npm run verify` if first checks pass.
