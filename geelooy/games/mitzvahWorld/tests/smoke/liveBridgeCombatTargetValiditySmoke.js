// B"H
import assert from "node:assert/strict";
import { validateCombatTarget } from "../../ckidsAwtsmoos/systems/combat/CombatTargetValidator.js";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";

const { data, movement } = makeLiveBridgeFixture();
const player = { position:{ x:0, z:0 } };
assert.equal(validateCombatTarget(data.npcs[0], player, { range:8 }).reason, "friendly-target", "live NPC cannot be attacked");
assert.equal(validateCombatTarget(data.animals[0], player, { range:8 }).reason, "friendly-target", "live passive animal cannot be attacked");
assert.equal(validateCombatTarget(data.hostiles[0], player, { range:8 }).ok, true, "live hostile in range can be attacked");
movement.setInputLocked(true, "test-cutscene");
assert.equal(movement.olam.__inputLocked, true, "input lock is visible to live combat manager");
console.log("B'H liveBridgeCombatTargetValiditySmoke passed");
