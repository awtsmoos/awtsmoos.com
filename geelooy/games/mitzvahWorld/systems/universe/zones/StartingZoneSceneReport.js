// B"H
import { cinematicPacketReport } from "../../cutscene/packets/CinematicPacketReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function startingZoneSceneReport(cinematic = {}) { return { scene:cinematic.scene?.id || null, tracks:cinematic.report?.tracks || 0, beats:cinematic.report?.beats || 0, packets:cinematicPacketReport(cinematic.packets || []), memory:cinematic.worldState?.memory || [], quests:cinematic.worldState?.quests || {} }; }
export default startingZoneSceneReport;
