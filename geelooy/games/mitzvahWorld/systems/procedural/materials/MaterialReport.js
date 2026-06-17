// B"H
export function materialReport(packet = {}) { return { id:packet.id || null, uniforms:packet.uniforms?.length || 0, hasVertex:Boolean(packet.vertexShader), hasFragment:Boolean(packet.fragmentShader) }; }
