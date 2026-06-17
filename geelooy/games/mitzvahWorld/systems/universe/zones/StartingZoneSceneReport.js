// B"H
import { cinematicPacketReport } from "../../cutscene/packets/CinematicPacketReport.js";
export function startingZoneSceneReport(cinematic = {}) { return { scene:cinematic.scene?.id || null, tracks:cinematic.report?.tracks || 0, beats:cinematic.report?.beats || 0, packets:cinematicPacketReport(cinematic.packets || []), memory:cinematic.worldState?.memory || [], quests:cinematic.worldState?.quests || {} }; }
export default startingZoneSceneReport;
