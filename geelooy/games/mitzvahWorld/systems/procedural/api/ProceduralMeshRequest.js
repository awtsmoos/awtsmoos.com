// B"H
import { normalizeMeshConfig } from "./ProceduralMeshConfigSchema.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function proceduralMeshRequest(config = {}) { const normalized = normalizeMeshConfig(config); return { id:`request:${normalized.id}`, kind:"procedural_mesh_request", config:normalized, at:new Date().toISOString() }; }
