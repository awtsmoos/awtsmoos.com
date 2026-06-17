// B"H
import { commandsToSefiros } from "../../sefiros/SefirosGateway.js";
import { sefirosScenePlan } from "../../sefiros/SefirosScenePlan.js";
export function installUniverseAsSefiros(id, commands = []) { return sefirosScenePlan(id || "universe_sefiros", commandsToSefiros(commands)); }
