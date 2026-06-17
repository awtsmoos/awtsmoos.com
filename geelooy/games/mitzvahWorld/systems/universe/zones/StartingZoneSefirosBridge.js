// B"H
import { commandsToSefiros } from "../../sefiros/SefirosGateway.js";
import { sefirosScenePlan } from "../../sefiros/SefirosScenePlan.js";
export function startingZoneSefirosBridge(zone = {}) { const packets = commandsToSefiros(zone.objects || []); return sefirosScenePlan(zone.manifest?.id || "starting_zone", packets); }
