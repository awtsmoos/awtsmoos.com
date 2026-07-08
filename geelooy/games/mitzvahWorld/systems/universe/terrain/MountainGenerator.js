// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function generateMountainCommands(zone = {}) { return (zone.terrain?.mountains || []).map((m,i)=>applyManualOverride({ type:"mountain", id:m.id || `mountain_${i+1}`, height:m.height || 25, radius:m.radius || 20, procedural:{ recipe:"mountain" }, command:"ensure_mountain", source:m }, m)); }
