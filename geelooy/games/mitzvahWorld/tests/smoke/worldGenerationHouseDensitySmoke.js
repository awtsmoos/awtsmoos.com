// B"H
import assert from "node:assert/strict";
import { validateVillageDensity } from "../../ckidsAwtsmoos/systems/worldGeneration/VillageDensityValidator.js";

const houses = [];
const roads = [];
const points = [];
for (let x = 5; x <= 55; x += 10) {
  roads.push({ id:`road_${x}`, x, z:30, width:3, depth:60 });
  for (let z of [10, 20, 40, 50]) {
    houses.push({ id:`house_${x}_${z}`, x, z, width:5, depth:5 });
    points.push({ id:`yard_${x}_${z}`, x:x + 3, z:z + 2 });
  }
}
const doors = houses.map(h => ({ id:`door_${h.id}`, x:h.x, z:h.z + 3 }));
const result = validateVillageDensity({
  bounds:{ minX:0, maxX:62, minZ:0, maxZ:62 },
  houses,
  roads,
  points,
  doors,
  spawns:[{ id:"player_spawn", x:2, z:2, radius:0.55 }],
  maxEmptyRatio:0.48
});

assert.equal(result.ok, true, `dense village validates: ${result.issues.join(", ")}`);

const bad = validateVillageDensity({
  bounds:{ minX:0, maxX:100, minZ:0, maxZ:100 },
  houses:[{ id:"lonely_house", x:10, z:10, width:4, depth:4 }],
  spawns:[{ id:"bad_spawn", x:10, z:10, radius:0.55 }],
  maxEmptyRatio:0.5
});
assert.equal(bad.ok, false, "empty/blocking village fails validation");
assert(bad.issues.some(i => i.startsWith("spawn-blocked")), "blocked spawn is reported");

console.log("B'H worldGenerationHouseDensitySmoke passed", result);
