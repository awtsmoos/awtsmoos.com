// B"H
import { sefirosCinematicQueue } from "../../render/sefiros/SefirosCinematicQueue.js";
export function sefirosCutsceneBridge(timelineOrScene = {}, packets = []) { const timeline = timelineOrScene.timeline || timelineOrScene; return { sefirah:"hod", kind:"sefiros_cutscene", timeline, queue:sefirosCinematicQueue(packets), report:{ tracks:timeline.tracks?.length || 0, packets:packets.length } }; }
export default sefirosCutsceneBridge;
