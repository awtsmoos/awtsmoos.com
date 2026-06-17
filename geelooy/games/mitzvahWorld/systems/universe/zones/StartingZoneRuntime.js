// B"H
import { compileStartingZone } from "./StartingZoneCompiler.js";
import { executeStartingZone } from "./StartingZonePhysicalExecutor.js";
export function buildStartingZoneRuntime(zoneJson = {}) { const compiled = compileStartingZone(zoneJson); const executed = executeStartingZone(compiled); return { compiled, executed, report:executed.report }; }
