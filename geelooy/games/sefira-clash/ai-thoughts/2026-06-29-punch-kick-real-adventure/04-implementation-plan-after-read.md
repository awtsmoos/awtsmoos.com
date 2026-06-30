# B'H — Implementation Plan After Real Read

Observed truth:

- Punch/kick selection lives in `directionalAttack.js` and `movePicker.js`.
- Attack state scaling lives in `attackState.js`.
- Attack impulse lives in `startAttack.js`.
- Hit geometry and event feel live in `attackGeometry.js` / `combatEvents.js`.
- Adventure levels already carry metadata and maps already mark `rules.adventure`.
- Adventure currently clears mostly as combat survival; powerups are generic and hidden spark count is not passed into records.

Final touch list:

1. Add `js/combat/attackTraits.js` to define jab/kick/sweep/meteor traits.
2. Add `js/combat/attackImpulse.js` so attack movement is distinct and readable.
3. Rewrite `js/data/attacks.js` with sharper jab/kick values.
4. Rewrite `js/combat/attackState.js` to apply family-aware charge, rapid, range, active frames.
5. Rewrite `js/combat/directionalAttack.js` so punch and kick choose different real moves.
6. Rewrite `js/combat/rapidAttack.js` for clearer rapid punch vs rapid kick behavior.
7. Rewrite `js/combat/startAttack.js` to use the split impulse module.
8. Rewrite `js/combat/attackGeometry.js` and `combatEvents.js` for reach/effect flavor.
9. Add `js/adventure/adventureRun.js` for real gate progress: sparks, hidden sparks, enemies left, clear text.
10. Rewrite `js/core/state.js` and `js/core/loop.js` to create/step adventure progress.
11. Rewrite `js/data/adventure/adventureFactory.js` to preserve visible vs hidden Spark spawns.
12. Rewrite `js/powerups/powerupFactory.js`, `powerupSystem.js`, and pickup effects so Adventure Sparks are real tracked pickups.
13. Add `js/render/v3/hud/AdventureHud.js` and rewrite `js/render/ui.js` to draw the real Adventure objective HUD.
14. Rewrite `js/main.js` to persist hidden sparks when an Adventure gate is cleared.

No partial patching. Every file touched is a full rewrite.
