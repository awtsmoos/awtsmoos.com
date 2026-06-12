B"H
# Simulation Issues Full Ordered Implementation Plan

## User mandate
Do everything fully in order.

## Ordered targets
1. Fix `stageMood.js` personality always reading as `keter`.
2. Implement objective value and objective claim plan.
3. Wire opportunity and strategy commands to objectives/items.
4. Reduce EdgeCarry over-dominance and improve direct kill/pressure choice.
5. Add map-specific rules for Pinball/Vast/Bouncer and AI modifiers.
6. Upgrade stageDirector to use map mood/rules/objective zones.
7. Add story tracker/events for memorable beats.
8. Add simulation issue report tool.
9. Run targeted and standard simulations.

## Ground rules
- Whole-file rewrites only.
- Prefer new small modules instead of giant files.
- Run real harnesses after changes.
- If all-map Android audit is too heavy, run chunked/targeted reports.

## Expected measurable improvements
- Stage mood personality no longer always `keter`.
- ObjectiveClaims should become nonzero in at least some test windows or objective opportunity should visibly register.
- Item and objective opportunities should increase.
- EdgeCarry counts should be less dominant relative to other intents on Pinball/Vast.
- StoryBeats should no longer be 0 on combat-heavy simulations.
- Pinball short-match DPM should not regress.
