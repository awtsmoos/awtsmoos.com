// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { withModifierStack } from "../modifiers/UniverseModifierStack.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function generateBranchHouseCommands(zone = {}) { return (zone.houses || []).map((h,i)=>withModifierStack(applyManualOverride({ type:"branch_house", id:h.id || `branch_house_${i+1}`, style:h.style || "branch_woven", procedural:{ recipe:"branch_house" }, command:"ensure_branch_house", source:h }, h), h)); }
