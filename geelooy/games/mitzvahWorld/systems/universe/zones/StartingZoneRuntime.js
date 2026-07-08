// B"H
import { compileStartingZone } from "./StartingZoneCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { executeStartingZone } from "./StartingZonePhysicalExecutor.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { startingZoneCinematicBridge } from "./StartingZoneCinematicBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function buildStartingZoneRuntime(zoneJson = {}) { const compiled = compileStartingZone(zoneJson); const executed = executeStartingZone(compiled); const cinematic = startingZoneCinematicBridge(compiled, zoneJson); return { compiled, executed, cinematic, report:{ compiled:compiled.report, executed:executed.report, cinematic:cinematic.summary } }; }
export default buildStartingZoneRuntime;
