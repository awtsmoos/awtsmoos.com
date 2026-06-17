// B"H
import { startingZoneFirstScene } from "./StartingZoneFirstScene.js";
import { CutsceneRuntime } from "../../cutscene/CutsceneRuntime.js";
import { bridgeCutsceneWorldState } from "../../cutscene/CutsceneWorldStateBridge.js";
import { sefirosCutsceneBridge } from "../../cutscene/sefiros/SefirosCutsceneBridge.js";
import { cutsceneReport } from "../../cutscene/CutsceneReport.js";
export function bootstrapStartingZoneScene(compiledZone = {}, zoneJson = {}) { const scene = startingZoneFirstScene(compiledZone, zoneJson); const runtime = new CutsceneRuntime([scene]); runtime.play(scene.id); const steps = [0,.2,1,1,1,2,2].map(delta => runtime.step(delta)); const packets = runtime.queue.snapshot().packets; const worldState = bridgeCutsceneWorldState({}, scene.consequences || []); return { scene, runtime:runtime.snapshot(), steps, packets, worldState, sefiros:sefirosCutsceneBridge(runtime.scenes.get(scene.id), packets), report:cutsceneReport(runtime.scenes.get(scene.id)) }; }
export default bootstrapStartingZoneScene;
