// B"H
import { compileStartingZone } from "./StartingZoneCompiler.js";
import { executeStartingZone } from "./StartingZonePhysicalExecutor.js";
import { startingZoneCinematicBridge } from "./StartingZoneCinematicBridge.js";
export function buildStartingZoneRuntime(zoneJson = {}) { const compiled = compileStartingZone(zoneJson); const executed = executeStartingZone(compiled); const cinematic = startingZoneCinematicBridge(compiled, zoneJson); return { compiled, executed, cinematic, report:{ compiled:compiled.report, executed:executed.report, cinematic:cinematic.summary } }; }
export default buildStartingZoneRuntime;
