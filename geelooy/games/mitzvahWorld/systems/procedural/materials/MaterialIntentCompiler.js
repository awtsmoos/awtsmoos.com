// B"H
import { shaderByName } from "./ShaderLibrary.js";
import { shaderUniformPacket } from "./ShaderUniformPacket.js";
import { shaderMaterialPacket } from "./ShaderMaterialPacket.js";
export function compileMaterialIntent(renderData = {}) { const id = `${renderData.id || renderData.geometry?.id || "mesh"}_material`; const material = renderData.material || {}; const shader = renderData.shader || shaderByName(material.shader || "basic"); const uniforms = Object.entries(material.uniforms || {}).map(([k,v]) => shaderUniformPacket(k, v)); return shaderMaterialPacket(id, shader, uniforms); }
