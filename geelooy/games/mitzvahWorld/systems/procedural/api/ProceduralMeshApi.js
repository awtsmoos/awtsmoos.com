// B"H
import { proceduralMeshRequest } from "./ProceduralMeshRequest.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralMeshResponse, proceduralMeshFailure } from "./ProceduralMeshResponse.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { compileProceduralRenderData } from "../core/ProceduralRenderDataCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function createProceduralMeshPacket(config = {}) { const request = proceduralMeshRequest(config); try { return proceduralMeshResponse(request, compileProceduralRenderData(request.config)); } catch (error) { return proceduralMeshFailure(request, error); } }
export function createProceduralMeshPackets(configs = []) { return configs.map(createProceduralMeshPacket); }
