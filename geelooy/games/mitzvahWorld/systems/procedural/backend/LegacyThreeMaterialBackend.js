// B"H
export function legacyMaterialBackendSummary(material = {}) { return { backend:"legacy_3d_material", id:material.id, shader:Boolean(material.vertexShader && material.fragmentShader), uniforms:material.uniforms?.length || 0 }; }
