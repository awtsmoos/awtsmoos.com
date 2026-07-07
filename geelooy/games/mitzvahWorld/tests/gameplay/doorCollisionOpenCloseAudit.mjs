// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const scene = JSON.parse(readFileSync("data/universe/examples/chossidBusyActionGameplayScene.json", "utf8"));
const door = scene.doors.find(d => d.id === "cottage_door_main");
assert(door, "main cottage door fixture missing");
assert.equal(door.clickable, true, "door must be desktop clickable");
assert.equal(door.tappable, true, "door must be mobile tappable");
assert.equal(door.closedBlocks, true, "closed door must block player");
assert.equal(door.openPasses, true, "open door must let player pass");
assert.equal(door.collisionUpdates, true, "door collision must update when state changes");
assert(door.proxyRadius >= 2, "door tap/click proxy must be forgiving");
console.log(JSON.stringify({ ok:true, test:"doorCollisionOpenCloseAudit", door }, null, 2));
