// B"H
import { startingZoneFirstScene } from "./StartingZoneFirstScene.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { CutsceneRuntime } from "../../cutscene/CutsceneRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { bridgeCutsceneWorldState } from "../../cutscene/CutsceneWorldStateBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { sefirosCutsceneBridge } from "../../cutscene/sefiros/SefirosCutsceneBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { cutsceneReport } from "../../cutscene/CutsceneReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function bootstrapStartingZoneScene(compiledZone = {}, zoneJson = {}) { const scene = startingZoneFirstScene(compiledZone, zoneJson); const runtime = new CutsceneRuntime([scene]); runtime.play(scene.id); const steps = [0,.2,1,1,1,2,2].map(delta => runtime.step(delta)); const packets = runtime.queue.snapshot().packets; const worldState = bridgeCutsceneWorldState({}, scene.consequences || []); return { scene, runtime:runtime.snapshot(), steps, packets, worldState, sefiros:sefirosCutsceneBridge(runtime.scenes.get(scene.id), packets), report:cutsceneReport(runtime.scenes.get(scene.id)) }; }
export default bootstrapStartingZoneScene;
