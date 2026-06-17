// B"H
export function bufferGeometryReport(packet = {}) { return { id:packet.id || null, attributes:Object.keys(packet.attributes || {}).length, vertices:packet.attributes?.position?.count || 0, indices:packet.index?.count || 0, primitive:packet.meta?.primitive || null }; }
