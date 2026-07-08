// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { normalizeLootTable } from "../loot/LootTable.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function generateTreeCommands(zone = {}) { return (zone.terrain?.trees || []).map((t,i)=>applyManualOverride({ type:"tree", id:t.id || `tree_${i+1}`, species:t.species || "cedar", lootTable:normalizeLootTable(t.loot || { wood:.8 }), procedural:{ recipe:t.procedural?.recipe || "tree" }, command:"ensure_tree", source:t }, t)); }
