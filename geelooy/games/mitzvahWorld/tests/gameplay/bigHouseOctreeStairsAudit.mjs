// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const scene = JSON.parse(readFileSync("data/universe/examples/chossidBusyActionGameplayScene.json", "utf8"));
const house = scene.houses.find(h => h.id === "big_study_house");
assert(house, "big study house fixture missing");
assert(house.nearPlayerFullDetail, "near player house must be full detail");
assert(house.stories >= 2, "house must be multistory");
assert(house.stairs, "house must have stairs");
assert(house.interiorAccessible, "house interior must be accessible");
for (const collider of ["walls", "floors", "door", "stairs"]) assert(house.colliders.includes(collider), `missing collider ${collider}`);
assert(house.octree, "house must be included in octree");
assert(house.neverImpostorNearPlayer, "near house must not use broken impostor shells");
console.log(JSON.stringify({ ok:true, test:"bigHouseOctreeStairsAudit", house }, null, 2));
