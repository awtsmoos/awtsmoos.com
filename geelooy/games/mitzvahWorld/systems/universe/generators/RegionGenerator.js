// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js";
import { withModifierStack } from "../modifiers/UniverseModifierStack.js";
export function generateRegionCommands(universe = {}) { return (universe.regions || []).map((r, i) => withModifierStack(applyManualOverride({ type:"region", id:r.id || `region_${i+1}`, title:r.title || r.id || `Region ${i+1}`, mood:r.mood || "neutral", command:"ensure_region", source:r }, r), r)); }
export default generateRegionCommands;
