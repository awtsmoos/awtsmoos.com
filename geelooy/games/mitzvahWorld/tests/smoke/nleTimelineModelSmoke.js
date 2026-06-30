// B"H
import assert from "node:assert/strict";
import { NleTimelineModel } from "../../systems/cutscene/editor/NleTimelineModel.js";
import { CutsceneRuntime } from "../../systems/cutscene/CutsceneRuntime.js";

const model = new NleTimelineModel({ id:"nle_intro", tracks:[], play:{ once:true, when:{ event:"enterWorld" } } });
model.addTrack("dialogue", { id:"dialogue_lane" });
model.addBeat("dialogue_lane", { id:"line", at:1, speaker:"rebbe", text:"The same JSON plays." });
model.addTrack("actor", { id:"player_lane", actor:"player", keyframes:[] });
model.addBeat("player_lane", { id:"pose", at:2, pose:"idle" });
model.moveBeat("dialogue_lane", "line", 1.5);
assert.equal(model.validate({ actors:["player", "rebbe"] }).ok, true);

const restored = NleTimelineModel.deserialize(model.serialize());
assert.deepEqual(restored.missingReferences({ actors:["rebbe"], quests:[], doors:[], triggers:[] }).actors, ["player"]);
const runtimeTimeline = restored.toRuntimeTimeline();
const runtime = new CutsceneRuntime([runtimeTimeline]);
runtime.play(runtimeTimeline.id);
const packets = [runtime.step(2), runtime.step(1)].flatMap(step => step.packets);
assert.equal(packets.some(packet => packet.kind === "dialogue"), true);
assert.equal(packets.some(packet => packet.kind === "animation"), true);
assert.equal(restored.removeBeat("dialogue_lane", "line"), true);
console.log("B'H nle timeline model smoke passed");
