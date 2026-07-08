// B"H
import { compileStartingZoneTerrain } from "../terrain/StartingZoneTerrainCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { generateAnimalCommands } from "../animals/AnimalGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { compileDialogueSet } from "../dialogue/BranchingDialogueCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { generateBranchHouseCommands } from "../buildings/BranchHouseGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { compileAtmosphere } from "../atmosphere/AtmosphereCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { applyManualOverride } from "../manual/ManualOverrideLayer.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
function npcCommands(zone = {}) { return (zone.npcs || []).map((n,i)=>applyManualOverride({ type:"zone_npc", id:n.id || `zone_npc_${i+1}`, dialogue:n.dialogue || null, role:n.role || "guide", command:"spawn_zone_npc", source:n }, n)); }
export function compileZoneObjects(zone = {}) { const dialogues = compileDialogueSet(zone.dialogues || []); return { objects:[...compileStartingZoneTerrain(zone), ...generateBranchHouseCommands(zone), ...generateAnimalCommands(zone), ...npcCommands(zone), ...compileAtmosphere(zone)], dialogues }; }
