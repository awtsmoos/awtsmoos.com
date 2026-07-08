// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { withModifierStack } from "../modifiers/UniverseModifierStack.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function generateBuildingCommands(universe = {}) { return (universe.buildings || []).map((b, i) => withModifierStack(applyManualOverride({ type:"building", id:b.id || `building_${i+1}`, title:b.title || b.id, owner:b.owner || "community", purpose:b.purpose || "decorative_until_connected", procedural:b.procedural || null, command:"ensure_building", source:b }, b), b)); }
export default generateBuildingCommands;
