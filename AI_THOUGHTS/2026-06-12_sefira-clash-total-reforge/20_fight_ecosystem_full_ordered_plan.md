B"H
# Fight Ecosystem Full Ordered Plan

## User mandate
Do everything in order, story step fully.

## Ordered systems
1. Fight clusters: identify hot/large/nearest fights.
2. Resource roles: assign Hunter, ResourceRunner, Denier, EdgeGuard, AntiAir, Survivor, CenterControl.
3. Commitment leases: prevent jitter/abandoning objective/item/trap too quickly.
4. EdgeCarry memory/cooldown: reduce repeated failed carry dominance.
5. Vast-specific anti-wander/rally pull: force central clustering during quiet.
6. Resource ping: stage broadcasts objective/item urgency.
7. Story-step full: narrative events should include cluster/resource/rivalry/role moments.
8. Sim issue report rerun and final review.

## Files to create
- `js/ai/advanced/strategy/fightClusters.js`
- `js/ai/advanced/strategy/roleAssignment.js`
- `js/ai/advanced/strategy/commitmentLease.js`
- `js/ai/advanced/edge/edgeCarryMemory.js`
- `js/ai/advanced/strategy/resourcePing.js`
- `js/ai/advanced/strategy/antiWanderLaw.js`

## Files to rewrite
- `js/ai/advanced/navigation/worldModel.js`
- `js/ai/advanced/strategy/opportunityModel.js`
- `js/ai/advanced/commands/strategyCommands.js`
- `js/ai/advanced/commands/commandArbiter.js`
- `js/ai/advanced/edge/edgeCarryPlan.js`
- `js/stage/events/stageDirector.js`
- `js/stage/items/itemSpawner.js`
- `js/stage/objectives/objectiveDirector.js`
- `js/stage/narrative/stageStoryEvents.js`
- `tools/simulation-issue-report.mjs`

## Verification
- Run `simulation-issue-report` on standard 3 maps.
- Run `reforge-audit` and `simulate-ai-match`.
- Check line counts.

## Expected outcomes
- Vast quiet frames reduced or softened by rally behavior.
- Objectives/items claimed more consistently.
- EdgeCarry ratio reduced further, especially Vast/Bouncer.
- Story beats include resource/cluster/role moments.
