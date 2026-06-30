// B"H
import assert from "node:assert/strict";
import { validateCombatTarget } from "../../ckidsAwtsmoos/systems/combat/CombatTargetValidator.js";
import { combatTargetAllowed } from "../../ckidsAwtsmoos/systems/combat/CombatTargetPolicy.js";

const player = { position:{ x:0, z:0 } };
const friendlyNpc = { userData:{ kind:"npc", friendly:true }, position:{ x:2, z:0 } };
const passiveAnimal = { userData:{ kind:"animal", species:"sheep", peaceful:true }, position:{ x:3, z:0 } };
const hostile = { userData:{ kind:"creature", hostile:true, attackable:true }, position:{ x:4, z:0 }, hp:10 };
const farHostile = { userData:{ kind:"creature", hostile:true, attackable:true }, position:{ x:40, z:0 }, hp:10 };
const deadHostile = { userData:{ kind:"creature", hostile:true, attackable:true, dead:true }, position:{ x:4, z:0 }, hp:0 };

assert.equal(validateCombatTarget(friendlyNpc, player, { range:8 }).reason, "friendly-target", "friendly NPC cannot be attacked");
assert.equal(validateCombatTarget(passiveAnimal, player, { range:8 }).reason, "friendly-target", "passive animal cannot be attacked");
assert.equal(validateCombatTarget(farHostile, player, { range:8 }).reason, "out-of-range", "far hostile cannot be hit");
assert.equal(validateCombatTarget(deadHostile, player, { range:8 }).reason, "dead-target", "dead target clears");
assert.equal(validateCombatTarget(hostile, player, { range:8 }).ok, true, "hostile in range is valid");

assert.equal(combatTargetAllowed({ wildlifeActor:true, peaceful:true, species:"goat" }, "goat"), false, "live targeting refuses peaceful wildlife");
assert.equal(combatTargetAllowed({ wildlifeActor:true, hostile:true }, "fox"), true, "live targeting accepts hostile wildlife");
assert.equal(combatTargetAllowed({ proceduralSkinnedAnimal:true }, "deer"), false, "wildlife visuals are not attackable by default");

console.log("B'H combatTargetValiditySmoke passed");
