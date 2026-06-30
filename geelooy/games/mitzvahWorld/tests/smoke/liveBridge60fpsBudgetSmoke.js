// B"H
import assert from "node:assert/strict";
import { createLiveBridgeFrameBudgetProbe } from "../../ckidsAwtsmoos/systems/performance/LiveBridgeFrameBudgetProbe.js";
import { liveBridgeReport } from "../../ckidsAwtsmoos/systems/collision/CollisionLiveWorldAdapter.js";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";

const houses = [], doors = [], npcs = [], animals = [], hostiles = [], triggers = [];
for (let i = 0; i < 48; i++) {
  const row = Math.floor(i / 12), col = i % 12, x = 8 + col * 6, z = 6 + row * 8;
  houses.push({ id:`house_${i}`, x, z, width:3, depth:3 });
  doors.push({ id:`door_${i}`, x, z:z + 2, width:1, depth:.35, open:i % 2 === 0 });
  npcs.push({ id:`npc_${i}`, userData:{ kind:"npc", friendly:true }, position:{ x:x - 2, z:z - 1 } });
  animals.push({ id:`goat_${i}`, userData:{ kind:"animal", peaceful:true, species:"goat" }, position:{ x:x + 2, z:z - 1 } });
  hostiles.push({ id:`fox_${i}`, userData:{ kind:"creature", hostile:true, attackable:true }, position:{ x:x + 2, z:z + 2 }, hp:20 });
  if (i < 24) triggers.push({ id:`trigger_${i}`, kind:"quest-zone", x, z:z + 4, width:2, depth:2, trigger:true });
}

const roads = [6, 14, 22, 30].map((z, i) => ({ id:`road_${i}`, x:42, z:z + 2, width:90, depth:4 }));
const points = houses.flatMap(h => [{ id:`yard_${h.id}`, x:h.x + 2, z:h.z }, { id:`garden_${h.id}`, x:h.x - 2, z:h.z + 2 }]);
const spawns = [{ id:"player_spawn", x:0, z:0, radius:.55 }, { id:"npc_spawn", x:1, z:0, radius:.55 }, { id:"animal_spawn", x:2, z:0, radius:.55 }];
const bounds = { minX:-2, maxX:82, minZ:0, maxZ:40 };
const { bridge, movement, events } = makeLiveBridgeFixture({ data:{ bounds, houses, doors, roads, points, npcs, animals, hostiles, triggers, hazards:[], spawns } });
const probe = createLiveBridgeFrameBudgetProbe();

for (let frame = 0; frame < 300; frame++) probe.measure(() => movement.step({ x:1, z:Math.sin(frame / 18), speed:7 }, 1 / 60));

const report = probe.report({ ...liveBridgeReport(bridge), targetHudEvents:events.filter(e => e.name === "targetHud").length, totalEvents:events.length, qualityReduced:false, liveBridgeUsed:true });
assert.equal(report.density.ok, true, `dense live bridge density holds: ${report.density.issues.join(",")}`);
assert(report.avgMs < 4, `average live bridge logic budget holds: ${JSON.stringify(report)}`);
assert(report.p95Ms < 16.67, `p95 live bridge logic budget holds: ${JSON.stringify(report)}`);
assert(report.colliders >= 120, "dense bridge keeps collider richness");
assert(report.broadphase.maxCandidates <= 8, "broadphase candidates stay bounded");
assert(report.npcs === 48 && report.animals === 48 && report.hostiles === 48, "entity density preserved");
console.log("B'H liveBridge60fpsBudgetSmoke passed", report);
