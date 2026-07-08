// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function generateFenceCommands(zone = {}) { return (zone.terrain?.fences || []).map((f,i)=>applyManualOverride({ type:"fence", id:f.id || `fence_${i+1}`, from:f.from || [0,0,0], to:f.to || [1,0,0], procedural:{ recipe:"fence" }, command:"ensure_fence", source:f }, f)); }
