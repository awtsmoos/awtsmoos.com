// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { withModifierStack } from "../modifiers/UniverseModifierStack.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function generateRegionCommands(universe = {}) { return (universe.regions || []).map((r, i) => withModifierStack(applyManualOverride({ type:"region", id:r.id || `region_${i+1}`, title:r.title || r.id || `Region ${i+1}`, mood:r.mood || "neutral", command:"ensure_region", source:r }, r), r)); }
export default generateRegionCommands;
