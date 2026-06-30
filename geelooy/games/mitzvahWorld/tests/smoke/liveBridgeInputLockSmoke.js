// B"H
import assert from "node:assert/strict";
import { makeLiveBridgeFixture, eventCount } from "../helpers/liveBridgeFixture.js";

const { olam, movement, events } = makeLiveBridgeFixture();
movement.setInputLocked(true, "manual-test");
const before = { ...olam.player.mesh.position };
movement.step({ x:1, z:0, speed:40 }, 1);
assert.equal(olam.player.mesh.position.x, before.x, "input lock prevents movement");
movement.setInputLocked(false, "manual-test-finished");
movement.step({ x:1, z:0, speed:2 }, 1 / 10);
assert(olam.player.mesh.position.x > before.x, "unlock restores movement");
assert.equal(eventCount(events, "inputLock"), 2, "lock/unlock events are paired");
console.log("B'H liveBridgeInputLockSmoke passed");
