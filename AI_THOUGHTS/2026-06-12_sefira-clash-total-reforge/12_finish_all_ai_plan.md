B"H
# Finish All AI Plan

## Remaining mandate from user
Finish all remaining realistic AI implementation:
- Real Kill Mode.
- Pressure vs Commitment.
- Landing Trap attack selection.
- Map-specific engagement issue.
- Rivalry system.

## Actual approach
Avoid a giant rewrite. Use current split AI architecture:
1. Add `strategy/rivalrySystem.js` to bias targets by recent damage/threat.
2. Add `combat/pressureCommitment.js` to classify chosen tactic as pressure, commit, kill, trap, or bait.
3. Rewrite `attackFamilyScore.js` to consume reputation, landing trap, hunt clock, kill mode, and pressure/commitment.
4. Rewrite `killConfirmPlanner.js` for sharper high-percent choices.
5. Rewrite `targetScoring.js` to include rivalry and reduce same-platform comfort more aggressively.
6. Rewrite `moveCommands.js` to use platform desire/landing traps as movement goals.
7. Rewrite `npcMind.js` to update rivalry and expose debug info.

## Specific behavior
- Repeated blockers get grabs.
- Frequent jumpers/fallers get anti-air/landing traps.
- Charged targets get punish options.
- High-percent targets get launcher/edge/charge preference.
- Quiet maps force hunt movement and ignore non-critical items.
- Bots choose platform desire or trap point as actual chase target.

## Verification
Run:
- `node tools/reforge-audit.mjs --count 3 --frames 900 --bots 4`
- `node tools/simulate-ai-match.mjs --count 3 --frames 900 --bots 4 --fast`
- targeted `merkava-pinball-court` and `tiferes-vast` longer simulations.
