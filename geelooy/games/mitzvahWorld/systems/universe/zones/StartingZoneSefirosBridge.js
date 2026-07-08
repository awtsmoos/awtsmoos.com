// B"H
import { commandsToSefiros } from "../../sefiros/SefirosGateway.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { sefirosScenePlan } from "../../sefiros/SefirosScenePlan.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function startingZoneSefirosBridge(zone = {}) { const packets = commandsToSefiros(zone.objects || []); return sefirosScenePlan(zone.manifest?.id || "starting_zone", packets); }
