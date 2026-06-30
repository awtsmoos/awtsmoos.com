// B"H
import assert from "node:assert/strict";
import { validateAnimalGround } from "../../ckidsAwtsmoos/systems/ground/EntityGroundValidator.js";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";
import { buildDenseWorldData } from "../helpers/longRun/DenseWorldData.js";

for (const data of [makeLiveBridgeFixture().data, buildDenseWorldData(48)]) {
  const fixture = makeLiveBridgeFixture({ data });
  const result = validateAnimalGround(data.animals, { world:fixture.bridge.world, bounds:data.bounds });
  assert.equal(result.ok, true, `animals above ground: ${JSON.stringify(result.violations)}`);
  assert.equal(result.checked, data.animals.length, "every animal checked");
}

console.log("B'H animalsAboveGroundSmoke passed");
