B"H
# Second Pass Plan — Specific Files and Interfaces

## Files to add
1. `geelooy/games/sefira-clash/js/data/combatTuning.js`
   - Data-only tuning for combo decay, rapid stun, hitstop, launch DI, kill danger, and event feel.
2. `geelooy/games/sefira-clash/js/combat/comboSystem.js`
   - Pure combo tracking: attacker streaks, defender pressure, escape grace, score, announcements.
3. `geelooy/games/sefira-clash/js/combat/combatEvents.js`
   - Event builder for hit, combo, launch debug, kill confirm metadata, and readable effect semantics.
4. `geelooy/games/sefira-clash/js/ai/advanced/personality/personalityConfig.js`
   - Data-driven AI personalities.
5. `geelooy/games/sefira-clash/js/ai/advanced/personality/applyPersonality.js`
   - Deterministic personality assignment from bot index/seed.
6. `geelooy/games/sefira-clash/tools/reforge-audit.mjs`
   - Lightweight simulation/audit report.

## Files to fully rewrite
1. `geelooy/games/sefira-clash/js/combat/attackResolver.js`
   - Complete rewrite preserving public `resolveAttacks(state)` export.
   - Imports new combo/event/tuning modules.
   - Keeps grab, shield, ohr shield, scars, camera, broadphase, weapon interactions.
   - Adds combo decay/escape, rich hit metadata, rapid fairness, diagnostics.
2. `geelooy/games/sefira-clash/js/physics/knockback.js`
   - Complete rewrite preserving `applyKnockback` and `launchScale` exports.
   - Adds `predictLaunch` export for debug tools/AI.
   - Adds directional influence using last input, percent scaling, rapid stun cap.
3. `geelooy/games/sefira-clash/js/core/state.js`
   - Complete rewrite preserving `createGameState` export.
   - Adds personality assignment and diagnostics object.

## Avoid touching in first implementation
- `solveSkeleton.js`: too large and risky; procedural pose work can be a later pass.
- `particles.js`: existing event renderer likely handles hit events; enrich event data first.
- `renderer/ui.js`: may already render narratives/events; avoid blind UI rewriting until after tests.

## Verification
- Run existing `tools/simulate-ai-match.mjs` if compatible.
- Run new `tools/reforge-audit.mjs`.
- Run syntax check on touched JS files.

## 20 improvements over first brainstorm
1. Separate data from logic.
2. Preserve existing exports.
3. Do not touch giant renderer until event path is known.
4. Add personality without forcing AI rewrite.
5. Make rapid stun capped but real.
6. Make knockback prediction available to debug/AI.
7. Add defender combo state for escape.
8. Add combo scoring separate from damage.
9. Add kill danger metadata.
10. Add launch vector debug metadata.
11. Track max combo in match diagnostics.
12. Track rapid hits in diagnostics.
13. Track total hit count.
14. Keep event names compatible.
15. Keep `state.events` as existing bus.
16. Avoid random personalities; deterministic assignment.
17. Use simple math, no heavy particles.
18. Use comments to document design intent.
19. Test with Node import/simulation.
20. Report exact blockers if existing sim fails.
