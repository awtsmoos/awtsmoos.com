// B"H
import { normalizeMeshConfig } from "./ProceduralMeshConfigSchema.js";
export function proceduralMeshRequest(config = {}) { const normalized = normalizeMeshConfig(config); return { id:`request:${normalized.id}`, kind:"procedural_mesh_request", config:normalized, at:new Date().toISOString() }; }
