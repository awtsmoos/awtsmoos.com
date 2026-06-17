// B"H
import { proceduralMeshRequest } from "./ProceduralMeshRequest.js";
import { proceduralMeshResponse, proceduralMeshFailure } from "./ProceduralMeshResponse.js";
import { compileProceduralRenderData } from "../core/ProceduralRenderDataCompiler.js";
export function createProceduralMeshPacket(config = {}) { const request = proceduralMeshRequest(config); try { return proceduralMeshResponse(request, compileProceduralRenderData(request.config)); } catch (error) { return proceduralMeshFailure(request, error); } }
export function createProceduralMeshPackets(configs = []) { return configs.map(createProceduralMeshPacket); }
