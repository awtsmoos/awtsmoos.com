// B"H
import assert from "node:assert/strict";
import CollisionWorld2D from "../../ckidsAwtsmoos/systems/collision/CollisionWorld2D.js";
import { findMissingWalls, probeSolidBody } from "../../ckidsAwtsmoos/systems/collision/probes/MissingWallDetector.js";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";

const fixture = makeLiveBridgeFixture();
const solids = [...fixture.bridge.world.bodies.values()].filter(body => body.solid && body.kind !== "door");
for (const body of solids) assert.equal(probeSolidBody(fixture.bridge.world, body).hit, true, `${body.id} blocks`);

const empty = new CollisionWorld2D();
assert.deepEqual(findMissingWalls(empty), [], "no declared walls means no missing-wall checks");
assert.equal(findMissingWalls(fixture.bridge.world).length, 0, "declared live solids block movement");
console.log("B'H missingWallDetectionSmoke passed");
