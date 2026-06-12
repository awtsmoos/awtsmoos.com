B'H
# 18 — NPC and Wildlife Continuation Diary

## NPC schedules implemented
Touched:
- `region/npc/NpcProfessionBehaviors.js`
- `region/npc/NpcRouteNetwork.js`
- `region/npc/NpcScheduleDirector.js`
- `region/render/RegionNpcRuntime.js`

Actual change:
- NPC schedules are no longer zero.
- Schedules now include roles: shliach, melamed, merchant, guide, farmer, shepherd, child.
- Each schedule has home, work, speed, and morning/noon/evening/night destinations.
- Runtime consumes schedules and sets NPC motion mode to `daily-role-routes-home-work-phase`.

Verified:
- Syntax checks passed.
- Director smoke test returned `npcSchedules: 7`.
- Browser proof later showed runtime stats with `npcRuntime: { npcs: 5, schedules: 7, mode: daily-role-routes-home-work-phase }`.

## Postbuild proof protection implemented
Touched:
- `postbuild/MitzvahWorldPostBuild.js`

Actual change:
- Shader/ecology material warming is now skipped as proof-first ornament instead of awaited heavy warm work.
- Runtime proof, NPC schedules, and living layers complete before any optional visual ornament can stall.

Verified:
- Syntax passed.
- Browser proof before this rewrite already reached living runtime done; after this rewrite the app server entered connection churn before a new proof could complete, so postbuild final-done proof remains pending.

## Wildlife AI implemented
Touched:
- `region/wildlife/AnimalSpeciesCatalog.js`
- `region/wildlife/AnimalNeedsModel.js`
- `region/wildlife/AnimalTerritories.js`
- `region/wildlife/PredatorPreyScheduler.js`
- `region/wildlife/WildlifeDirector.js`
- `region/render/RegionWildlifeRenderer.js`

Actual change:
- Wildlife plan now generates 56 animals from biome/territory data.
- Species counts:
  - rabbit: 12
  - fox: 4
  - deer: 8
  - frog: 10
  - goat: 6
  - bird: 16
- Wildlife now has needs: hunger, thirst, fear, sleep, territory weight.
- Predator/prey rules now exist:
  - fox hunts rabbit
  - rabbit flees fox
  - deer flees player
  - frog drinks marsh
  - goat climbs ridge
  - birds flock/rise
- Runtime state machine now updates animal state and motion: hunt, attack, flee, fleePlayer, graze, drink, climb, flock, patrol, hide.

Verified:
- Syntax checks passed.
- Director smoke test returned `wildlife: 56`, by-species counts, 6 events, 1 predator rule.

## Current hard reality
The local app server became unstable after repeated Chrome/browser probes. I killed many stale `node index.js` processes. Before the churn, browser proof successfully showed living runtime completion, 11 layers, 2417 instances, merged collider proof, wildlife ticker, and NPC runtime. After the churn, compact proof sometimes hit connection refused because port 8080 would not stay in a clean listener state.

## Next exact continuation
1. Stabilize HTTP-only app server with a cleaner launcher or use a separate proof server path.
2. Re-run `regionProofNow.mjs` until it proves postbuild `done` and current wildlife/NPC stats.
3. Continue to collision and house/interior expansion if proof remains stable.

Awtsmoos chapter: the village has begun to breathe in schedules and instincts. The people now have destinations; the animals now have fear and hunger. The next gate is not imagination, but stable proof.
