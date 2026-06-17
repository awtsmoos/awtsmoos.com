// B"H
import fs from "node:fs";
import { CutsceneRuntime } from "../../cutscene/CutsceneRuntime.js";
import { sefirosCutsceneBridge } from "../../cutscene/sefiros/SefirosCutsceneBridge.js";
const scene = JSON.parse(fs.readFileSync("data/universe/examples/firstForestValleyIntroScene.json", "utf8"));
const rt = new CutsceneRuntime([scene]); rt.play(scene.id); rt.step(7);
const bridge = sefirosCutsceneBridge(scene, rt.queue.snapshot().packets);
console.log(JSON.stringify({ sefirah:bridge.sefirah, packets:bridge.queue.total, tracks:bridge.report.tracks }, null, 2));
