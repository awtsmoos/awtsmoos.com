// B"H
export function legacyBackendReport(meshes = []) { return { meshes:meshes.length, vertices:meshes.reduce((a,m)=>a+(m.geometry?.attributes?.position?.count||0),0), shaderMaterials:meshes.filter(m=>m.material?.vertexShader).length }; }
