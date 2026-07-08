// B"H
/** Gathers commands, movie queues, render packets, Sefiros plans, and procedural bridge packets. */
import { composeRenderCommands } from "../render/AwtsmoosRenderGateway.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { installUniverseScene } from "./installers/UniverseSceneInstaller.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { sefirosRenderGateway } from "../render/sefiros/SefirosRenderGateway.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { universeCommandReport } from "./reports/UniverseCommandReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { sefirosRenderReport } from "./reports/SefirosRenderReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { universeMigrationReport } from "./reports/UniverseMigrationReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralBuilding } from "./procedural/ProceduralBuildingBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralHuman } from "./procedural/ProceduralHumanBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralNature } from "./procedural/ProceduralNatureBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralPath } from "./procedural/ProceduralPathBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralBridgeReport } from "./procedural/ProceduralBridgeReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { sefirosManualIntent } from "../sefiros/SefirosManualIntent.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { sefirosModifierIntent } from "../sefiros/SefirosModifierIntent.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { sefirosGroupIntent } from "../sefiros/SefirosGroupIntent.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
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
