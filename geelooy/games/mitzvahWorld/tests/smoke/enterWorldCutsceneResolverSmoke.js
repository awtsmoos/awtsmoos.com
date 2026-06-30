// B"H
import assert from "node:assert/strict";
import { resolveCutscenesForEvent, markResolvedCutscenesSeen } from "../../systems/cutscene/CutsceneTriggerResolver.js";
import { isCutsceneSeen } from "../../systems/cutscene/CutsceneSeenState.js";

const holder = { worldState:{ flags:{} } };
const world = { cutscenes:[{ id:"intro", play:{ once:true, when:{ event:"enterWorld", worldId:"village" } }, beats:[{ kind:"dialogue", at:1, text:"Welcome." }] }] };
const first = resolveCutscenesForEvent({ type:"enterWorld", worldId:"village" }, world, holder);
assert.equal(first.resolved.length, 1);
markResolvedCutscenesSeen(holder, first.resolved);
assert.equal(isCutsceneSeen(holder, "intro"), true);
const second = resolveCutscenesForEvent({ type:"enterWorld", worldId:"village" }, world, holder);
assert.equal(second.resolved.length, 0);
assert.equal(second.skipped[0].reason, "seen-once");
console.log("B'H enter world cutscene resolver smoke passed");
