// B"H
import { bootstrapStartingZoneScene } from "./StartingZoneSceneBootstrap.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { startingZoneSceneReport } from "./StartingZoneSceneReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function startingZoneCinematicBridge(compiledZone = {}, zoneJson = {}) { const cinematic = bootstrapStartingZoneScene(compiledZone, zoneJson); cinematic.summary = startingZoneSceneReport(cinematic); return cinematic; }
export default startingZoneCinematicBridge;
