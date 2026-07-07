// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const scene = JSON.parse(readFileSync("data/universe/examples/chossidBusyActionGameplayScene.json", "utf8"));
const npc = scene.targets.find(t => t.id === scene.studyLoop.friendlyNpc);
assert(npc, "friendly study NPC missing");
assert.equal(npc.type, "friendly-npc", "study target must be friendly NPC");
assert.equal(npc.interaction, "study", "friendly NPC must expose study interaction");
assert(scene.studyLoop.prompt.includes("R"), "study prompt must expose R action");
assert(scene.studyLoop.dialogueOverlay, "study dialogue overlay must exist");
assert(scene.studyLoop.canStudyLongTime, "study loop must support long study sessions");
console.log(JSON.stringify({ ok:true, test:"friendlyNpcStudyLoopAudit", npc, studyLoop:scene.studyLoop }, null, 2));
