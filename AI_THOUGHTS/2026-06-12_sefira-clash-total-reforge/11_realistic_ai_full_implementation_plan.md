B"H
# Realistic AI Full Implementation Plan

## Goal
Implement the refined realistic systems, not random fantasy:
1. Hunt Clock / combat heat escalation.
2. Real Kill Instinct.
3. Platform Desire Map.
4. Landing Trap Prediction.
5. Attack Reputation Learning.

## Current inspected truth
- `npcMind.js` already has a strong world/enrichment pipeline.
- `combatHeat.js` exists but can become the Hunt Clock source of truth.
- `landingPredictor.js` exists; it needs to be used more directly in positioning/tactics.
- `worldModel.js` creates graph/current/goal/bestPlatform and target scoring.
- `attackFamilyScore.js` scores attack families but does not yet consume attack reputation/pattern memory strongly.
- `killConfirmPlanner.js` exists but is narrow.

## Implementation modules
Create:
- `strategy/huntClock.js`: stronger pressure from no-contact, far distance, and quiet stage.
- `strategy/platformDesireMap.js`: score current/goal/best/landing platforms and choose desire target.
- `strategy/attackReputation.js`: lightweight memory of enemy button/family habits and recovery/air habits.
- `strategy/landingTrap.js`: turns predicted landing into a committed trap pocket if valuable.

Rewrite:
- `strategy/combatHeat.js`: integrate hunt clock fields.
- `navigation/worldModel.js`: compute platform desire, attack reputation, and landing trap in world.
- `combat/positionPlanner.js`: honor landing traps/platform desire.
- `combat/families/attackFamilyScore.js`: use reputation and kill instinct to select counters.
- `combat/killConfirmPlanner.js`: more explicit kill mode choices.
- `npcMind.js`: expose debug fields for new systems.

## Realistic constraints
- No ML, no huge CPU cost.
- All systems are deterministic, local, small-object math.
- No giant file growth; split modules.
- Use existing simulator as behavioral verification.

## Expected player-visible outcome
- Bots disengage less after quiet stretches.
- Bots travel to meaningful platforms instead of local pacing.
- Bots wait near landing spots instead of blindly chasing current position.
- Bots punish repeated habits such as shields, jumps, charge, aerial recovery.
- High-percent enemies trigger sharper kill moves.

## Extra brainstorming inside scope
1. Bot “purpose labels” for debug overlay.
2. Pressure/commitment scalar visible in `aiMind.debug`.
3. Platform desire shifts toward center on huge maps during quiet.
4. Landing trap avoids trap if target lands too far away.
5. Reputation decays, so bots do not overfit forever.
6. Kill instinct grows near edges more than center.
7. Coward personality uses hunt clock slower, predator faster.
8. Trickster reputation counters shielders with grab/bait.
9. Berserker ignores platform desire safety.
10. Defensive bots take best platform if kill pressure is low.
