// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const houseWorld = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/collision/HouseCollisionWorld.js", "utf8");
const doorRuntime = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/houses/door/DoorInteractionRuntime.js", "utf8");
const doorCollider = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/houses/door/DoorColliderRuntime.js", "utf8");
const cottageRenderer = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/render/RegionCottageRenderer.js", "utf8");

assert(houseWorld.includes("SpatialBubbleIndex"), "house collision must use spatial buckets");
assert(houseWorld.includes("queueOctreeProxies") && houseWorld.includes("octreeProxyLimit"), "house colliders must enter octree in bounded chunks");
assert(houseWorld.includes("if (record?.proof?.door && record?.proof?.open === true) return false"), "open doors must not queue solid octree proxies");
assert(doorCollider.includes("isDoorSolid") && doorCollider.includes("return !doorState.open"), "door collider source must follow open/closed state");
assert(doorRuntime.includes("forceRefresh:true") && doorRuntime.includes("octree:true"), "door toggles must force house/octree collision refresh");
assert(cottageRenderer.includes("bigSolidRooms:true") && cottageRenderer.includes("clickableDoors:true"), "rendered houses must expose big solid rooms and clickable doors");
console.log(JSON.stringify({ ok:true, audit:"octreeHouseDoorAudit" }, null, 2));
