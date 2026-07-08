// B"H
import { shaderByName } from "./ShaderLibrary.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { shaderUniformPacket } from "./ShaderUniformPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { shaderMaterialPacket } from "./ShaderMaterialPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function compileMaterialIntent(renderData = {}) { const id = `${renderData.id || renderData.geometry?.id || "mesh"}_material`; const material = renderData.material || {}; const shader = renderData.shader || shaderByName(material.shader || "basic"); const uniforms = Object.entries(material.uniforms || {}).map(([k,v]) => shaderUniformPacket(k, v)); return shaderMaterialPacket(id, shader, uniforms); }
