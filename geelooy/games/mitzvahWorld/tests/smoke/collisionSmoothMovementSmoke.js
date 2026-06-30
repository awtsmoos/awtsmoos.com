// B"H
import assert from "node:assert/strict";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";

const { olam, movement } = makeLiveBridgeFixture();
olam.player.mesh.position.x = 5.9;
olam.player.mesh.position.z = -6;
const xs = [], zs = [];
for (let i = 0; i < 120; i++) {
  const out = movement.step({ x:0, z:1, speed:7 }, 1 / 60);
  xs.push(out.position.x); zs.push(out.position.z);
}
const xDrift = Math.max(...xs) - Math.min(...xs);
assert(xDrift < .02, "sliding along house wall does not jitter sideways");
assert(zs.at(-1) > zs[0], "parallel movement continues while touching wall");

olam.player.mesh.position.x = 28;
olam.player.mesh.position.z = 0;
const fast = movement.step({ x:1, z:0, speed:90 }, 1 / 10);
assert(fast.blocked, "high speed movement is swept/substepped");
assert(fast.position.x < 31.5, "player does not tunnel through thin wall");
console.log("B'H collisionSmoothMovementSmoke passed", { xDrift, fast:fast.position });
