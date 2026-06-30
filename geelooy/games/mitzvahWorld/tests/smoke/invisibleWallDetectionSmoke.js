// B"H
import assert from "node:assert/strict";
import CollisionWorld2D from "../../ckidsAwtsmoos/systems/collision/CollisionWorld2D.js";
import { unownedBlockers } from "../../ckidsAwtsmoos/systems/collision/probes/InvisibleWallDetector.js";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";

const fixture = makeLiveBridgeFixture();
const ownedMove = fixture.bridge.world.moveCircle({ x:0, z:0 }, { x:10, z:0 }, 0.55);
assert.equal(unownedBlockers(fixture.bridge.world, ownedMove.hits).length, 0, "owned house/wall blocks are explained");

const world = new CollisionWorld2D({ bodies:[{ x:2, z:0, width:1, depth:4, solid:true }] });
const blocked = world.moveCircle({ x:0, z:0 }, { x:4, z:0 }, 0.55);
assert.equal(unownedBlockers(world, blocked.hits).length, 1, "unowned blocker is flagged");
console.log("B'H invisibleWallDetectionSmoke passed");
