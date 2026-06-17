// B"H
export function shaderMaterialPacket(id, shader = {}, uniforms = []) { return { kind:"shader_material_packet", id, vertexShader:shader.vertex || shader.vertexShader || "", fragmentShader:shader.fragment || shader.fragmentShader || "", uniforms }; }
