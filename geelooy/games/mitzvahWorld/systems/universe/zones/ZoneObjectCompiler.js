// B"H
import { compileStartingZoneTerrain } from "../terrain/StartingZoneTerrainCompiler.js";
import { generateAnimalCommands } from "../animals/AnimalGenerator.js";
import { compileDialogueSet } from "../dialogue/BranchingDialogueCompiler.js";
import { generateBranchHouseCommands } from "../buildings/BranchHouseGenerator.js";
import { compileAtmosphere } from "../atmosphere/AtmosphereCompiler.js";
import { applyManualOverride } from "../manual/ManualOverrideLayer.js";
function npcCommands(zone = {}) { return (zone.npcs || []).map((n,i)=>applyManualOverride({ type:"zone_npc", id:n.id || `zone_npc_${i+1}`, dialogue:n.dialogue || null, role:n.role || "guide", command:"spawn_zone_npc", source:n }, n)); }
export function compileZoneObjects(zone = {}) { const dialogues = compileDialogueSet(zone.dialogues || []); return { objects:[...compileStartingZoneTerrain(zone), ...generateBranchHouseCommands(zone), ...generateAnimalCommands(zone), ...npcCommands(zone), ...compileAtmosphere(zone)], dialogues }; }
