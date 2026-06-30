// B"H
import assert from "node:assert/strict";
import { resolveCutscenesForEvent, markResolvedCutscenesSeen } from "../../systems/cutscene/CutsceneTriggerResolver.js";

const holder = { worldState:{ flags:{} } };
const source = { cutscenes:[
  { id:"quest_accept_rebbe", play:{ once:true, when:{ event:"questAccepted", questId:"the_first_shliach" } }, tracks:[{ type:"quest", events:[{ at:1, key:"quest_accept_seen" }] }] },
  { id:"zone_hint", play:{ when:{ event:"collisionEnter", triggerId:"starter_zone_gate" } }, tracks:[{ type:"dialogue", beats:[{ at:1, text:"This gate remembers enter events." }] }] }
] };
const quest = resolveCutscenesForEvent({ type:"questAccepted", questId:"the_first_shliach" }, source, holder);
assert.equal(quest.resolved[0].id, "quest_accept_rebbe");
markResolvedCutscenesSeen(holder, quest.resolved);
assert.equal(resolveCutscenesForEvent({ type:"questAccepted", questId:"the_first_shliach" }, source, holder).resolved.length, 0);
assert.equal(resolveCutscenesForEvent({ type:"collisionEnter", triggerId:"starter_zone_gate" }, source, holder).resolved[0].id, "zone_hint");
console.log("B'H quest cutscene bridge smoke passed");
