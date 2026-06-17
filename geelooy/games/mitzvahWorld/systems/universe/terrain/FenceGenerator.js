// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js";
export function generateFenceCommands(zone = {}) { return (zone.terrain?.fences || []).map((f,i)=>applyManualOverride({ type:"fence", id:f.id || `fence_${i+1}`, from:f.from || [0,0,0], to:f.to || [1,0,0], procedural:{ recipe:"fence" }, command:"ensure_fence", source:f }, f)); }
