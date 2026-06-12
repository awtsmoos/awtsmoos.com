B"H
# Fight Ecosystem Full Ordered Post Review

## Implemented in order
1. Fight clusters
   - Added `js/ai/advanced/strategy/fightClusters.js`.
   - NPC mind computes `state.fightClusters` each frame.
   - World model exposes nearest/hottest cluster and anti-wander can route toward it.

2. Resource roles
   - Added `js/ai/advanced/strategy/roleAssignment.js`.
   - Roles include Hunter, ResourceRunner, Denier, EdgeGuard, AntiAir, Survivor, CenterControl.
   - Opportunity model boosts objective/item/edge/anti-air/center based on role.

3. Commitment leases
   - Added `js/ai/advanced/strategy/commitmentLease.js`.
   - Command arbiter updates leases after opportunity selection.
   - Strategy commands follow active leases unless danger/kill state breaks them.

4. EdgeCarry memory/cooldown
   - Added `js/ai/advanced/edge/edgeCarryMemory.js`.
   - Opportunity model applies EdgeCarry penalty and updates memory.
   - KO intent was tightened so EdgeCarry only appears as a true late/near-edge option.

5. Vast anti-wander/rally pull
   - Added `js/ai/advanced/strategy/antiWanderLaw.js`.
   - Anti-wander routes to resource ping, hot cluster, center rally, or map center.
   - Hunt movement speed was increased in `physics/movement.js`.
   - Vast final quiet frame metric dropped from ~517 to 132 after stage activity and anti-wander changes.

6. Resource ping
   - Added `js/ai/advanced/strategy/resourcePing.js`.
   - Item and objective spawns now set resource pings.
   - Resource pings influence opportunity scoring, strategy movement, roles, and story beats.

7. Story step fully
   - Rewrote `stageVoiceLines.js` with resource ping, cluster, and role lines.
   - Rewrote `stageStoryEvents.js` to mark resource pings, hot clusters, and role moments.
   - Stage story remains integrated through `stageDirector.js` from previous pass.

8. Reporting
   - `tools/simulation-issue-report.mjs` now includes quiet frames, attack commands, route failures, EdgeCarry ratio, items/objectives, story beats, and mood.

## Final verification
Commands run:
- `node tools/simulation-issue-report.mjs --count 3 --frames 900 --bots 4`
- `node tools/reforge-audit.mjs --count 3 --frames 900 --bots 4`
- `node tools/simulate-ai-match.mjs --count 3 --frames 900 --bots 4 --fast`

All returned exit code 0.

## Final key signals
Issue report:
- `beit-midrash-bouncer`
  - DPM 418
  - KOs 3
  - storyBeats 20
  - objectives 1/2
  - items 1/2
  - EdgeCarry ratio 0
  - mood netzach-vertical
  - invalid 0

- `merkava-pinball-court`
  - DPM 498
  - KOs 3
  - storyBeats 18
  - objectives 2/2
  - items 1/2
  - EdgeCarry ratio 0
  - mood merkava-chaos
  - invalid 0

- `tiferes-vast`
  - DPM 340
  - KOs 1
  - storyBeats 15
  - objectives 2/2
  - items 2/2
  - EdgeCarry ratio 0
  - mood tiferes-control
  - invalid 0

Standard sim:
- ok true
- warnings none
- invalidAttackCommands 0
- namelessJumps 0
- EdgeCarry attempts 0 across all three tested maps
- Vast quietFrames 132

Reforge audit:
- ok true
- warnings none
- invalidAttackCommands 0
- averageDamagePerMinute 294.67
- totalKos 8

## Line counts
All touched files stayed under 120 lines:
- `stageStoryEvents.js`: 115
- `worldModel.js`: 100
- `npcMind.js`: 94
- others below 80.

## Honest remaining nuance
- In the standard sim, Bouncer and Pinball each picked up 1/2 stage-born items, while issue report showed healthier item behavior in some runs. Because simulation still includes combat randomness, 2/2 is not guaranteed on every short run.
- Full 22-map sweep remains a future chunked-audit task to avoid Android tunnel 504.

## Chapter close
The AI now sees fights as clusters, resources as bells, roles as vows, and EdgeCarry as a rare tool instead of a religion. The story step now watches the ecosystem itself, not merely punches. The arena has begun to behave less like isolated bots and more like a living battlefield.
