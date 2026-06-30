// B"H
import assert from "node:assert/strict";
import CollisionWorld2D from "../../ckidsAwtsmoos/systems/collision/CollisionWorld2D.js";
import CollisionTriggerRuntime from "../../ckidsAwtsmoos/systems/collision/CollisionTriggerRuntime.js";

const world = new CollisionWorld2D({ bodies:[
  { id:"locked_door", kind:"door", x:3, z:0, width:0.35, depth:3, solid:true, open:false },
  { id:"door_cutscene", kind:"cutscene-zone", x:1, z:0, width:1, depth:3, trigger:true }
] });
const triggers = new CollisionTriggerRuntime(world);

assert(world.moveCircle({ x:0, z:0 }, { x:5, z:0 }, 0.5).blocked, "closed door blocks");
world.setDoorOpen("locked_door", true);
const pass = world.moveCircle({ x:0, z:0 }, { x:5, z:0 }, 0.5);
assert(!pass.blocked, "open door permits movement");
assert(pass.position.x > 4.9, "open door transition path reaches far side");

const first = triggers.update("player", { x:1, z:0 }, 0.5);
const second = triggers.update("player", { x:1.1, z:0 }, 0.5);
const exit = triggers.update("player", { x:5, z:0 }, 0.5);
assert.equal(first.filter(e => e.type === "triggerEnter").length, 1, "trigger enter fires once");
assert.equal(second.length, 0, "standing inside trigger does not spam");
assert.equal(exit.filter(e => e.type === "triggerExit").length, 1, "trigger exit fires");

console.log("B'H collisionDoorTriggerSmoke passed", { first, exit });
