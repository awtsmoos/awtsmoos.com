// B"H
import assert from "node:assert/strict";
import { resolveCutscenesForEvent } from "../../systems/cutscene/CutsceneTriggerResolver.js";

function canOpenDoor(door, state) {
  if (door.requiredQuest && !state.completedMissions?.includes(door.requiredQuest)) return { ok:false, event:{ type:"doorDenied", doorId:door.id } };
  return { ok:true, event:{ type:"doorAccepted", doorId:door.id, targetSpawn:door.targetSpawn } };
}

const door = { id:"rebbe_house", requiredQuest:"the_first_shliach", targetSpawn:"inside_rebbe_house" };
const manifest = { timelines:[
  { id:"door_denied", play:{ when:{ event:"doorDenied", doorId:"rebbe_house" } }, beats:[{ kind:"dialogue", at:1, text:"Finish the shlichus first." }] },
  { id:"door_transition", play:{ when:{ event:"doorAccepted", doorId:"rebbe_house" } }, beats:[{ kind:"control", at:1, action:"lock_player_control" }] }
] };
assert.equal(resolveCutscenesForEvent(canOpenDoor(door, {}).event, manifest, {}).resolved[0].id, "door_denied");
assert.equal(resolveCutscenesForEvent(canOpenDoor(door, { completedMissions:["the_first_shliach"] }).event, manifest, {}).resolved[0].id, "door_transition");
console.log("B'H door cutscene transition smoke passed");
