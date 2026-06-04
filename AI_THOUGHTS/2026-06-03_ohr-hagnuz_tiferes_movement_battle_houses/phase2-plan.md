B"H
# Phase 2 plan: houses, Torah routes, clear story start

## Real inspection
- Exterior village map uses `W000W` rows inside house footprints. The renderer correctly treats `0` as floor, so the apparent missing house pieces are map data gaps, not only render gaps.
- Battle moves come from `AbilityIndex` -> `AbilityRuntime.currentMoves()` -> `OhrDebate.startDebate()`.
- Move cards currently show fixed skin descriptions, not the actual Torah route/quote/subcategory.
- Mobile guidance card exists but says generic guidance.

## Full-file rewrite targets
1. `WorldMapsVillage.js`
   - Rewrite exterior houses as complete exterior wall blocks with only passable door glyphs opening through the facade.
2. `State.js`
   - Add learned Torah route memory and clearer initial story guidance.
3. `AbilityIndex.js`
   - Give every move a category and routes with Mishnah / Chassidus / Kabbalah / Niggun quote lines.
4. `AbilityRuntime.js`
   - Resolve a learned route per move, unlock new route memories after battle use/victory, expose route summary for between-battle panels.
5. `OhrDebate.js`
   - Use route text/quote in logs and reward new routes.
6. `BattleMoveCards.js`
   - Display category + learned route subtitle/quote instead of generic skin descriptions.
7. `MobileControls.js`
   - Make the always-visible box clearly direct the player to start story; add learned route panel text in Journal/Menu.

## Safety
Every modified file will be rewritten completely. Then syntax checks and an import smoke will run.