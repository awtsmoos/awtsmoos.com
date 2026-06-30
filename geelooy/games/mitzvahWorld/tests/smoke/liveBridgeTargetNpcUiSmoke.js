// B"H
import assert from "node:assert/strict";
import { makeLiveBridgeFixture, eventCount } from "../helpers/liveBridgeFixture.js";

const { olam, movement, events } = makeLiveBridgeFixture();
movement.step({ x:0, z:0, speed:0 }, 1 / 60);
assert.equal(events.find(e => e.name === "targetHud")?.payload?.interactionType, "talk", "friendly NPC wins nearest target prompt");
for (let i = 0; i < 120; i++) movement.step({ x:0, z:0, speed:0 }, 1 / 60);
assert.equal(eventCount(events, "targetHud"), 1, "standing still does not spam target HUD");
olam.player.mesh.position.x = 4.8;
movement.step({ x:0, z:0, speed:0 }, 1 / 60);
const last = events.filter(e => e.name === "targetHud").at(-1).payload;
assert.equal(last.interactionType, "combat", "hostile creature target prompts combat");
console.log("B'H liveBridgeTargetNpcUiSmoke passed");
