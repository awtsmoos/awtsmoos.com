// B"H
import assert from "node:assert/strict";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";

const houses = Array.from({ length:18 }, (_, i) => ({ id:`generated_house_${i}`, x:6 + (i % 6) * 8, z:6 + Math.floor(i / 6) * 9, width:4, depth:4 }));
const doors = houses.map(h => ({ id:`door_${h.id}`, x:h.x, z:h.z + 3, width:1, depth:.35, open:true }));
const roads = [{ id:"road_a", x:26, z:9, width:60, depth:4 }, { id:"road_b", x:26, z:18, width:60, depth:4 }, { id:"road_c", x:26, z:27, width:60, depth:4 }];
const points = houses.flatMap(h => [{ id:`yard_${h.id}`, x:h.x + 3, z:h.z }, { id:`garden_${h.id}`, x:h.x - 3, z:h.z + 2 }]);
const spawns = [{ id:"player_spawn", x:0, z:0, radius:.55 }, { id:"npc_spawn", x:2, z:0, radius:.55 }, { id:"animal_spawn", x:3, z:0, radius:.55 }];
const bounds = { minX:-2, maxX:52, minZ:0, maxZ:30 };
const { bridge, movement, olam } = makeLiveBridgeFixture({ data:{ bounds, houses, doors, roads, points, spawns, triggers:[], hazards:[], npcs:[], animals:[], hostiles:[] } });
assert.equal(bridge.density.ok, true, `generated density validates: ${bridge.density.issues.join(",")}`);
olam.player.mesh.position.x = 2; olam.player.mesh.position.z = 6;
const blocked = movement.step({ x:1, z:0, speed:50 }, 1);
assert(blocked.blocked, "generated house live collider blocks movement");
console.log("B'H liveBridgeGeneratedHouseCollisionSmoke passed", bridge.density);
