// B"H
import assert from "node:assert/strict";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";

const { bridge, data } = makeLiveBridgeFixture();
for (const spawn of data.spawns) assert(bridge.world.isSpawnSafe(spawn, spawn.radius || .55), `${spawn.id} is spawn-safe`);
assert(!bridge.world.isSpawnSafe({ x:8, z:0 }, .55), "spawn inside house is rejected");
console.log("B'H liveBridgeSpawnSafetySmoke passed", { spawns:data.spawns.length });
