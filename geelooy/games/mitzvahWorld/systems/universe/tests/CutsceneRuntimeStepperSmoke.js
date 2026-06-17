// B"H
import fs from "node:fs";
import { CutsceneRuntime } from "../../cutscene/CutsceneRuntime.js";
const scene = JSON.parse(fs.readFileSync("data/universe/examples/firstForestValleyIntroScene.json", "utf8"));
const rt = new CutsceneRuntime([scene]);
rt.play(scene.id);
const out = [rt.step(.2), rt.step(1), rt.step(2), rt.step(3)];
console.log(JSON.stringify({ steps:out.length, packets:rt.queue.snapshot().total, byKind:rt.queue.snapshot().packets.reduce((a,p)=>{a[p.kind]=(a[p.kind]||0)+1;return a;},{}) }, null, 2));
