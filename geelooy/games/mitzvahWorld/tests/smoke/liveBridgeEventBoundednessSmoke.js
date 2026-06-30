// B"H
import assert from "node:assert/strict";
import { makeLiveBridgeFixture, eventCount } from "../helpers/liveBridgeFixture.js";

const { olam, movement, events } = makeLiveBridgeFixture();
olam.player.mesh.position.x = 0; olam.player.mesh.position.z = 8;
for (let i = 0; i < 300; i++) movement.step({ x:0, z:0, speed:0 }, 1 / 60);
assert.equal(eventCount(events, "triggerEnter"), 1, "300 trigger-stay frames emit one enter");
assert.equal(eventCount(events, "cutsceneStart"), 1, "300 trigger-stay frames emit one cutscene start");
assert(eventCount(events, "targetHud") <= 2, "target HUD is dirty-state bounded");
console.log("B'H liveBridgeEventBoundednessSmoke passed", { events:events.length });
