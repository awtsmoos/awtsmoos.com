B"H
# Phase 3: house access, real NPC visibility, layered Torah battle, animated effects, longer storyline

## Real causes found
1. Some doors cannot be reached because the lower exterior house put the door in row 12 while row 13 was solid wall below it. The clicked door tile was passable, but no adjacent open tile could reach it.
2. NPCs were visually weak or missing because `GlyphRenderer.drawNpc` passed the glyph letter as the animation progress argument to `Human.draw`, making the math `NaN`. The NPC body could disappear. It also never drew the identifying glyph label.
3. Battle effects were bland and often offscreen because `BattleEffects.pushBattleEffect` stored desktop-ish coordinates like x=590 even on a 390px phone canvas.
4. Battle choice is still flat. User wants category -> subcategory -> chapter -> quote.

## Full-file rewrite plan
- `WorldMapsVillage.js`: move lower doors to reachable bottom wall row and place visible story NPCs outside, on reachable road/grass.
- `GlyphRenderer.js`: pass numeric animation seed to Human and draw a clear glyph badge above NPCs.
- `StoryIndex.js`: longer sequential story path for guide and key NPCs.
- `AbilityIndex.js`: nested Torah route tree: category, route, chapter, quote.
- `AbilityRuntime.js`: expose route summary and category metadata.
- New `yesod/battle/TorahChoiceRuntime.js`: battle drill-down state/options, selected quote -> attack move, route learning.
- `OhrDebate.js`: category/route/chapter/quote battle flow; B backs up levels.
- `BattleMoveCards.js`: cards show current drill-down stage and breadcrumbs.
- `BattleEffects.js`: dynamic canvas-based explosions, beams, rings, floating letters.
- `BattleStage.js`: animated light background.

## Verification
- Syntax checks on all changed files.
- Node import smoke with DOM mock.
- Pathfinding smoke: reachable lower house door.
- Battle drill-down smoke: category -> route -> chapter -> quote -> move resolves.
