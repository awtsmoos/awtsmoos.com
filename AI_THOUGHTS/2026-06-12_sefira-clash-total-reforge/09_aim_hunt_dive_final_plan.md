B"H
# Final Plan — Aim Mirror, Hunt, Dive-Stomp, Rapid Truth

## Files to create
1. `js/controls/aimMemory.js`
   - Store attack aim with facing metadata.
   - If player manually attacks after turning around, mirror X while preserving angular height.
2. `js/ai/advanced/navigation/targetScoring.js`
   - Split target scoring out of `worldModel.js` so bots hunt across the map instead of over-valuing local comfort.

## Files to fully rewrite
1. `js/combat/inputIntent.js`
   - Use `rememberAttackAim` and `aimForAttack`.
2. `js/combat/rapidAttack.js`
   - Remove sticky wording and make rapid options explicitly full launch semantics.
3. `js/physics/knockback.js`
   - Rapid sets velocity exactly like normal hit; only stun is near-zero/agency-preserving.
4. `js/physics/movement.js`
   - Airborne down input triggers controlled dive velocity.
5. `js/physics/special/stomp.js`
   - Dive stomp: down-dive landing on head stuns/grounds victim briefly; bounce stomper; standard stomp remains.
6. `js/combat/attackResolver.js`
   - Any real hit wakes dive-stunned victim.
7. `js/ai/advanced/navigation/worldModel.js`
   - Import scoring module and reduce same-platform bias.
8. `js/ai/advanced/commands/moveCommands.js`
   - Stronger hunt when route is far/missing; avoid local idling.

## Feature additions beyond request
- Dive flag and dive cooldown.
- Stomp stun wake-on-hit.
- AI target boredom/hunt pressure.
- Lower same-platform camping bonus.
- Far target chase even without perfect route.
- Rapid comments/config match actual behavior.
- Debuggable jump/oscillation remains.

## Verification
- Syntax via tunnel writes.
- Simulation audit.
- Existing simulator.
- Line counts for touched files.
