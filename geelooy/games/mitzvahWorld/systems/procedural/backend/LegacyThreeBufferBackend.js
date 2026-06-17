// B"H
export function legacyBufferBackendSummary(geometry = {}) { return { backend:"legacy_3d_buffer", id:geometry.id, vertices:geometry.attributes?.position?.count || 0, indices:geometry.index?.count || 0 }; }
