// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { withModifierStack } from "../modifiers/UniverseModifierStack.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function generatePropCommands(universe = {}) { return (universe.props || []).map((p, i) => withModifierStack(applyManualOverride({ type:"prop", id:p.id || `prop_${i+1}`, role:p.role || "set_dressing", target:p.target || null, procedural:p.procedural || null, command:"ensure_prop", source:p }, p), p)); }
export default generatePropCommands;
