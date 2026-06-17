// B"H
import { bootstrapStartingZoneScene } from "./StartingZoneSceneBootstrap.js";
import { startingZoneSceneReport } from "./StartingZoneSceneReport.js";
export function startingZoneCinematicBridge(compiledZone = {}, zoneJson = {}) { const cinematic = bootstrapStartingZoneScene(compiledZone, zoneJson); cinematic.summary = startingZoneSceneReport(cinematic); return cinematic; }
export default startingZoneCinematicBridge;
