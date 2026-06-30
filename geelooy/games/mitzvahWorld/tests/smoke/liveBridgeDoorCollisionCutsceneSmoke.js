// B"H
import assert from "node:assert/strict";
import { makeLiveBridgeFixture, eventCount } from "../helpers/liveBridgeFixture.js";

const { bridge, olam, movement, events } = makeLiveBridgeFixture();
olam.player.mesh.position.x = 6; olam.player.mesh.position.z = 5.6;
movement.step({ x:0, z:1, speed:8 }, 1 / 4);
assert(eventCount(events, "doorDenied") >= 1, "locked door trigger emits denial once on enter");
const beforeSpam = eventCount(events, "doorDenied");
for (let i = 0; i < 60; i++) movement.step({ x:0, z:0, speed:0 }, 1 / 60);
assert.equal(eventCount(events, "doorDenied"), beforeSpam, "standing in locked door trigger does not spam denial");

bridge.world.setDoorOpen("door_a", true);
olam.player.mesh.position.x = 6; olam.player.mesh.position.z = 8.2;
const pass = movement.step({ x:0, z:1, speed:8 }, 1 / 4);
assert(!pass.blocked, "open door does not block bridge movement");
console.log("B'H liveBridgeDoorCollisionCutsceneSmoke passed");
