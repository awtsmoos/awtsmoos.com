// B"H
import assert from "node:assert/strict";
import { validatePlayerGround } from "../../ckidsAwtsmoos/systems/ground/EntityGroundValidator.js";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";

const fixture = makeLiveBridgeFixture();
const context = { world:fixture.bridge.world, bounds:fixture.data.bounds };

assert.equal(validatePlayerGround(fixture.olam.player, context).ok, true, "spawn starts above valid 2D ground");
for (let i = 0; i < 240; i++) {
  fixture.movement.step({ x:1, z:i < 120 ? 0 : 1, speed:7 }, 1 / 60);
  const result = validatePlayerGround(fixture.olam.player, context);
  assert.equal(result.ok, true, `player remains above ground at frame ${i}`);
}

fixture.movement.setInputLocked(true, "ground-test");
fixture.movement.step({ x:1, z:1, speed:20 }, 1 / 60);
assert.equal(validatePlayerGround(fixture.olam.player, context).ok, true, "input lock cannot push player underground");
console.log("B'H playerNeverUndergroundSmoke passed");
