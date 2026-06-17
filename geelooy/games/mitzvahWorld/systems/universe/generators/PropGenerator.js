// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js";
import { withModifierStack } from "../modifiers/UniverseModifierStack.js";
export function generatePropCommands(universe = {}) { return (universe.props || []).map((p, i) => withModifierStack(applyManualOverride({ type:"prop", id:p.id || `prop_${i+1}`, role:p.role || "set_dressing", target:p.target || null, procedural:p.procedural || null, command:"ensure_prop", source:p }, p), p)); }
export default generatePropCommands;
