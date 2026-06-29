// B"H
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const interaction = read("ckidsAwtsmoos/chayim/chossid/methods/interaction.js");
const controls = read("ckidsAwtsmoos/chayim/chossid/methods/controls.js");
const chossid = read("ckidsAwtsmoos/chayim/chossid/index.js");
const clickPolicy = read("ckidsAwtsmoos/chayim/chossid/methods/ClickTargetPolicy.js");
const npcTarget = read("ckidsAwtsmoos/dvarim/npc/NpcTargetRuntime.js");

assert(!interaction.includes("if (event.button !== 2) this.shoot?.();"), "missed terrain clicks must not attack");
assert(!controls.includes("if (!handled && event.button === 0) chossid.shoot?.();"), "mouse fallback must not attack on empty click");
assert(chossid.includes("Select an enemy first."), "shoot must refuse when no hostile target is selected");
assert(interaction.includes("ClickTargetPolicy"), "player interaction must use split click target policy");
assert(clickPolicy.includes("isAttackableTarget"), "click target policy must own attackability");
assert(clickPolicy.includes("isFriendlyTarget"), "click target policy must block friendly targets");

assert(npcTarget.includes('return { action: "target"'), "first friendly click must target");
assert(npcTarget.includes('return { action: "open"'), "right-click or second tap must open friendly NPC dialogue");
assert(npcTarget.includes('return { action: "wait"'), "left-click on selected friendly NPC must wait, not attack");

console.log("B\"H live interaction regression audit passed.");
