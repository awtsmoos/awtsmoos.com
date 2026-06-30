// B"H
import assert from "node:assert/strict";
import { makeLiveBridgeFixture, eventCount } from "../helpers/liveBridgeFixture.js";

const { olam, movement, events } = makeLiveBridgeFixture();
let hit = movement.step({ x:1, z:0, speed:90 }, 1);
assert(hit.blocked, "live bridge blocks solid house movement");
assert(olam.player.mesh.position.x < 6.5, "player remains outside house");

olam.player.mesh.position.x = 0; olam.player.mesh.position.z = 6;
movement.step({ x:0, z:1, speed:10 }, 1 / 5);
for (let i = 0; i < 20; i++) movement.step({ x:0, z:0, speed:0 }, 1 / 60);
movement.step({ x:0, z:-1, speed:20 }, 1);
assert.equal(eventCount(events, "triggerEnter"), 1, "live trigger enter fires once");
assert.equal(eventCount(events, "triggerExit"), 1, "live trigger exit fires");
assert.equal(eventCount(events, "cutsceneStart"), 1, "collision-triggered cutscene starts once");
console.log("B'H liveBridgeCollisionMovementSmoke passed");
