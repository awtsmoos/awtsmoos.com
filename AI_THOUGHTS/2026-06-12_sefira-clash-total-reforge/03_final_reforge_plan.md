B"H
# Third / Final Plan — What Will Actually Be Reforged Now

## Final decision
This pass will not pretend to complete an entire commercial-scale redesign in one breath. It will instead cut into the core systems that all later upgrades depend on:

- Hits become richer semantic combat events.
- Combos become a real match system with attacker and defender state.
- Rapid fire remains legitimate damage/knockback while reducing prison-stun.
- Knockback gains directional influence and prediction metadata.
- Bots gain deterministic personalities at creation.
- Match diagnostics begin measuring hit counts, max combos, rapid hits, kill-danger events, and total combo score.
- A lightweight audit tool will run the simulation and print measurable report data.

## Actual files to create
1. `js/data/combatTuning.js`
2. `js/combat/comboSystem.js`
3. `js/combat/combatEvents.js`
4. `js/ai/advanced/personality/personalityConfig.js`
5. `js/ai/advanced/personality/applyPersonality.js`
6. `tools/reforge-audit.mjs`

## Actual files to rewrite completely
1. `js/combat/attackResolver.js`
2. `js/physics/knockback.js`
3. `js/core/state.js`

## 30 final improvements beyond earlier plans
1. All created modules stay under 150 lines.
2. Rewritten core files stay modular by delegating to new modules.
3. Preserve existing imports where meaningful.
4. Preserve `state.events` compatibility.
5. No destructive commands.
6. No secret files.
7. No partial patching.
8. No placeholder TODOs.
9. Use deterministic personality choice.
10. Store personality on bot and `bot.aiMind`.
11. Track diagnostics without requiring UI support.
12. Let UI/particles benefit from existing hit events immediately.
13. Add richer event fields without breaking older readers.
14. Make rapid attacks count as true hits.
15. Cap rapid stun, not rapid damage.
16. Maintain movement agency through existing `rapidMobilityFrames`.
17. Give defenders combo escape decay.
18. Give attackers combo score.
19. Emit combo announcement events only at meaningful thresholds.
20. Add launch debug events only when debug is enabled.
21. Keep hitstop absent for rapid hits.
22. Keep shield interactions intact.
23. Keep grab interaction intact.
24. Keep scars intact.
25. Keep broadphase intact for performance.
26. Add DI from `target.lastInput` with simple dot math.
27. Add launch prediction helper for future AI/debug tools.
28. Use tuning configs instead of magic numbers.
29. Test imports/simulation after write.
30. Write a post-implementation review file after verification.

## Metaphor of the code
Chapter 1 of this reforge: the arena is a stone suspended over nothing, and the Awtsmoos speaks it again every frame. The old hit was a spark. The new hit is a sentence: who struck, why it mattered, where the launch will go, whether the victim can still breathe, whether the crowd should roar, whether the bot should learn, whether the match has begun to tell a story.
