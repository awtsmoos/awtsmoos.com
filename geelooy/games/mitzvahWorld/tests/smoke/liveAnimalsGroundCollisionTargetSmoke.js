// B"H
import assert from "node:assert/strict";
import { validateCombatTarget } from "../../ckidsAwtsmoos/systems/combat/CombatTargetValidator.js";
import { classifyTarget } from "../../ckidsAwtsmoos/systems/targeting/TargetClassifier.js";
import { validateAnimalGround } from "../../ckidsAwtsmoos/systems/ground/EntityGroundValidator.js";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";

const fixture = makeLiveBridgeFixture();
const animal = fixture.data.animals[0];
const hostile = fixture.data.hostiles[0];
const player = { position:{ x:0, z:0 } };

assert.equal(validateAnimalGround(fixture.data.animals, { world:fixture.bridge.world, bounds:fixture.data.bounds }).ok, true);
assert.equal(classifyTarget(animal, { playerPosition:player.position }).attackable, false, "animal is passive");
assert.equal(validateCombatTarget(animal, player, { range:10 }).reason, "friendly-target", "passive animal combat denied");
assert.equal(classifyTarget(hostile, { playerPosition:player.position }).attackable, true, "hostile remains attackable");
console.log("B'H liveAnimalsGroundCollisionTargetSmoke passed");
