// B"H
import { compileBufferGeometry } from "../procedural/buffer/BufferGeometryCompiler.js";
import { compileMaterialIntent } from "../procedural/materials/MaterialIntentCompiler.js";
export function proceduralRenderMeshPacket(response = {}) { const data = response.result || response; return { kind:"procedural_render_mesh", id:data.id || data.geometry?.id, geometry:compileBufferGeometry(data), material:compileMaterialIntent(data), source:data }; }
