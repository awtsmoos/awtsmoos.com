// B"H
/** Turns imported universe data into manual-aware, modifier-expanded runtime commands. */
import { UniverseStateStore } from "./UniverseStateStore.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { generateRegionCommands } from "./generators/RegionGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { generateBuildingCommands } from "./generators/BuildingGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { generateRoadCommands } from "./generators/RoadGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { generatePropCommands } from "./generators/PropGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { generateNpcSpawnCommands } from "./generators/NpcSpawnGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { generateQuestCommands } from "./generators/QuestGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { generateCutsceneCommands } from "./generators/CutsceneGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { compileCommandModifiers } from "./modifiers/ModifierCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { manualControlReport } from "./manual/ManualControlReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { modifierReport } from "./modifiers/ModifierReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function buildUniverseRuntime(imported = {}) {
  const store = new UniverseStateStore({ world:imported.summary?.world || imported.universe?.world || null });
  const rawCommands = [ ...generateRegionCommands(imported.universe), ...generateBuildingCommands(imported.universe), ...generateRoadCommands(imported.universe), ...generatePropCommands(imported.universe), ...generateNpcSpawnCommands(imported.beings || []), ...generateQuestCommands(imported.universe), ...generateCutsceneCommands(imported.cutscenes || []) ];
  const commands = compileCommandModifiers(rawCommands);
  const reports = { manual:manualControlReport(commands), modifiers:modifierReport(commands) };
  store.set("rawCommands", rawCommands); store.set("commands", commands); store.set("reports", reports); store.set("graph", imported.graph || null); store.set("episodes", imported.episodes || []); store.event("universe_runtime_built", { rawCommands:rawCommands.length, commands:commands.length });
  return { store, rawCommands, commands, reports, snapshot:store.snapshot(), stats:{ rawCommands:rawCommands.length, commands:commands.length, events:store.get("events", []).length } };
}
export default buildUniverseRuntime;
