// B"H
import assert from "node:assert/strict";
import CollisionWorld2D from "../../ckidsAwtsmoos/systems/collision/CollisionWorld2D.js";
import { classifyTarget, nearestTarget } from "../../ckidsAwtsmoos/systems/targeting/TargetClassifier.js";
import { targetHudPayload } from "../../ckidsAwtsmoos/systems/targeting/TargetingHudBridge.js";

const world = new CollisionWorld2D({ bodies:[
  { id:"rebbe_talk_zone", kind:"npc-zone", x:2, z:0, width:3, depth:3, trigger:true, solid:false },
  { id:"goat_body", kind:"creature", x:5, z:0, width:1, depth:1, solid:false }
] });

assert.equal(world.blockingAt({ x:2, z:0 }, 0.5).length, 0, "NPC interaction zone is soft");
assert.equal(world.queryCircle({ x:2, z:0 }, 0.5, b => b.trigger).length, 1, "NPC interaction zone is queryable");

const rebbe = { id:"rebbe", name:"Rebbe", userData:{ kind:"npc", friendly:true }, position:{ x:2, z:0 } };
const goat = { id:"goat", name:"Village Goat", userData:{ kind:"animal", species:"goat", peaceful:true }, position:{ x:5, z:0 } };
const fox = { id:"fox", name:"Wild Fox", userData:{ kind:"creature", species:"fox", hostile:true, attackable:true }, position:{ x:6, z:0 } };

assert.equal(classifyTarget(rebbe, { playerPosition:{ x:0, z:0 } }).interactionType, "talk", "friendly NPC targets as dialogue");
assert.equal(classifyTarget(goat, { playerPosition:{ x:0, z:0 } }).attackable, false, "peaceful animal is not attackable");
assert.equal(classifyTarget(fox, { playerPosition:{ x:0, z:0 } }).attackable, true, "hostile creature is attackable");
assert.equal(nearestTarget([fox, goat, rebbe], { playerPosition:{ x:0, z:0 } }).id, "rebbe", "nearest interaction is stable");
assert.equal(targetHudPayload(fox, { playerPosition:{ x:0, z:0 }, range:10 }).prompt, "Attack", "HUD payload prompts attack for hostile");

console.log("B'H collisionNpcCreatureTargetSmoke passed");
