// B"H
import assert from "node:assert/strict";
import { CutsceneRuntime } from "../../systems/cutscene/CutsceneRuntime.js";
import { normalizeCutsceneTimeline, validateCutsceneTimeline } from "../../systems/cutscene/CutsceneTimelineSchema.js";

const timeline = normalizeCutsceneTimeline({
  id:"intro_rebbe_village_arrival",
  play:{ once:true, when:{ event:"enterWorld", worldId:"village" } },
  tracks:[
    { type:"hud", events:[{ id:"hide", at:1, action:"hide" }, { id:"show", at:4, action:"show" }] },
    { type:"camera", keyframes:[{ id:"focus_rebbe", at:2, focus:"rebbe", duration:1 }] },
    { type:"dialogue", beats:[{ id:"rebbe_line", at:3, speaker:"rebbe", text:"Welcome, young shliach." }] },
    { type:"actor", actor:"player", keyframes:[{ id:"face_rebbe", at:3.5, face:"rebbe", pose:"idle" }] },
    { type:"quest", events:[{ id:"seen_flag", at:4, key:"intro_seen", value:true }] }
  ]
});

const validation = validateCutsceneTimeline(timeline, { actors:["player", "rebbe"] });
assert.equal(validation.ok, true);
const runtime = new CutsceneRuntime([timeline]);
assert.equal(runtime.play(timeline.id).ok, true);
const packets = [runtime.step(1), runtime.step(1), runtime.step(1), runtime.step(1)].flatMap(step => step.packets);
const kinds = packets.map(packet => packet.kind);
assert.equal(kinds.filter(kind => kind === "control").length, 2);
assert.equal(kinds.includes("camera_focus"), true);
assert.equal(kinds.includes("dialogue"), true);
assert.equal(kinds.includes("animation"), true);
assert.equal(kinds.includes("consequence"), true);
assert.equal(packets.find(packet => packet.kind === "dialogue").payload.text, "Welcome, young shliach.");
assert.equal(packets.find(packet => packet.kind === "consequence").payload.consequences[0].key, "intro_seen");
console.log("B'H cutscene runtime smoke passed");
