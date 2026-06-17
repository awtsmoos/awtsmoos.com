// B"H
/** Gathers commands, movie queues, render packets, Sefiros plans, and procedural bridge packets. */
import { composeRenderCommands } from "../render/AwtsmoosRenderGateway.js";
import { installUniverseScene } from "./installers/UniverseSceneInstaller.js";
import { sefirosRenderGateway } from "../render/sefiros/SefirosRenderGateway.js";
import { universeCommandReport } from "./reports/UniverseCommandReport.js";
import { sefirosRenderReport } from "./reports/SefirosRenderReport.js";
import { universeMigrationReport } from "./reports/UniverseMigrationReport.js";
import { proceduralBuilding } from "./procedural/ProceduralBuildingBridge.js";
import { proceduralHuman } from "./procedural/ProceduralHumanBridge.js";
import { proceduralNature } from "./procedural/ProceduralNatureBridge.js";
import { proceduralPath } from "./procedural/ProceduralPathBridge.js";
import { proceduralBridgeReport } from "./procedural/ProceduralBridgeReport.js";
import { sefirosManualIntent } from "../sefiros/SefirosManualIntent.js";
import { sefirosModifierIntent } from "../sefiros/SefirosModifierIntent.js";
import { sefirosGroupIntent } from "../sefiros/SefirosGroupIntent.js";
function proceduralPacket(command) { if (command.type === "building") return proceduralBuilding(command); if (command.type === "npc_spawn") return proceduralHuman(command); if (command.type === "road") return proceduralPath(command); return proceduralNature(command); }
function controlIntents(commands) { return commands.flatMap(c => [sefirosManualIntent(c.id, c.manual || {}), sefirosModifierIntent(c.id, c.modifiers || []), sefirosGroupIntent(c.id, c.group || "ungrouped")]); }
export function buildUniverseConstructionPlan({ runtime, movie = null, animations = null } = {}) {
  const commands = runtime?.commands || [], base = { id:"movie_universe_scene", commands, movie, animations };
  const procedural = commands.map(proceduralPacket), sefiros = installUniverseScene(base.id, commands);
  sefiros.sefiros.sefiros.items.push(...controlIntents(commands));
  const render = composeRenderCommands(base), sefirosRender = sefirosRenderGateway(sefiros.sefiros);
  const reports = { commands:universeCommandReport(commands), sefiros:sefirosRenderReport(sefiros.sefiros), migration:universeMigrationReport(), procedural:proceduralBridgeReport(procedural), manual:runtime?.reports?.manual || null, modifiers:runtime?.reports?.modifiers || null };
  return { ...base, render, sefiros, sefirosRender, procedural, reports, stats:{ commands:commands.length, camera:movie?.camera?.length || 0, animations:animations?.locomotion?.queued?.length || 0, sefirosPackets:sefiros.sefiros.sefiros.items.length, proceduralPackets:procedural.length } };
}
export default buildUniverseConstructionPlan;
