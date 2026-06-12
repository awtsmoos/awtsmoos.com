B"H
# Aim Memory, Hunting, Dive-Stomp, Rapid Truth — Brainstorm

## User observations
1. Remembering last click position is good.
2. If the player turns around and presses buttons manually, the stored angular aim should mirror to the opposite direction.
3. Bots still stay in their own area too much, pace, and jump around.
4. Head-stomp should become a purposeful downward dive: press down in air to dive into enemies; landing on them stuns them briefly; any hit wakes them.
5. Rapid fire should not lock targets in place. Every rapid hit must be like a normal single hit with full throw/launch displacement.
6. Brainstorm 10 additional improvements.

## 10 additional improvements
1. AI hunt urgency meter: every bot gets bored if no damage dealt/received and then expands target radius aggressively.
2. Cross-platform chase escalation: if target is on another platform for too long, choose route even if route cost is high.
3. Attack whiff memory: bots stop repeating moves that miss in the same spacing.
4. Threat orbiting: bots circle at strike range instead of walking into target center.
5. Ledge baiting: predator bots intentionally fake retreats near ledge to invite chase.
6. Recovery sniping: bots predict recoveries and choose downward/side launch angles near blast zones.
7. Team chaos avoidance: bots avoid clumping into the same target unless kill confirm is available.
8. Dive-stomp AI: airborne bots dive only when target is below and horizontal alignment is close.
9. Wake-up rule: stomp stun breaks instantly on any real hit so it is dramatic, not oppressive.
10. Combat heat director: stage/AI increases items/hazards if combat quiets too long.

## Plan
Create:
- `js/controls/aimMemory.js`: mirror stored click/manual aim when facing reverses.
- `js/ai/advanced/navigation/huntPressure.js`: score target urgency and far chase.

Rewrite:
- `js/combat/inputIntent.js`: use aim memory/mirroring for manual buttons.
- `js/physics/movement.js`: add airborne down-input dive flag/velocity.
- `js/physics/special/stomp.js`: distinguish dive stomp, stun victim, bounce stomper, wake victim on hit later.
- `js/combat/attackResolver.js`: wake dive-stunned targets on any real hit.
- `js/physics/knockback.js`: ensure rapid hits set velocity like normal and do not preserve/zero knockback; reduce only stun, not displacement.
- `js/ai/advanced/navigation/worldModel.js`: target scoring should hunt farther and not over-prefer same-platform idling.
- Maybe `js/ai/advanced/commands/moveCommands.js`: when route not found or target far, use committed chase direction rather than local pacing.

## Highest risk
- `worldModel.js` is over 120 lines. If rewritten, split target selection into modules to keep size sane.
- Dive should not break normal fast fall/drop-through. It should require airborne down input and downward intent.
- Stomp stun must not become a prison: wake on hit, timer short.
