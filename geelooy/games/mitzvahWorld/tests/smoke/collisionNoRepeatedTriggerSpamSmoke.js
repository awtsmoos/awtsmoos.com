// B"H
import assert from "node:assert/strict";
import CollisionWorld2D from "../../ckidsAwtsmoos/systems/collision/CollisionWorld2D.js";
import CollisionTriggerRuntime from "../../ckidsAwtsmoos/systems/collision/CollisionTriggerRuntime.js";

const world = new CollisionWorld2D({ bodies:[
  { id:"quest_intro", kind:"quest-zone", x:0, z:0, width:4, depth:4, trigger:true, once:true }
] });
const runtime = new CollisionTriggerRuntime(world);
let enters = 0, exits = 0;

for (let i = 0; i < 90; i++) {
  for (const event of runtime.update("player", { x:0, z:0 }, 0.5)) {
    if (event.type === "triggerEnter") enters++;
    if (event.type === "triggerExit") exits++;
  }
}
for (const event of runtime.update("player", { x:8, z:0 }, 0.5)) if (event.type === "triggerExit") exits++;
for (const event of runtime.update("player", { x:0, z:0 }, 0.5)) if (event.type === "triggerEnter") enters++;

assert.equal(enters, 1, "once trigger enters only once even after re-entry");
assert.equal(exits, 1, "exit remains recognized");
console.log("B'H collisionNoRepeatedTriggerSpamSmoke passed", { enters, exits });
