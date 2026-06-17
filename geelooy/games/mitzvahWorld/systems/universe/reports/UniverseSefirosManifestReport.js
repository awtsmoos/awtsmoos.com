// B"H
export function universeSefirosManifestReport(physical = {}) { return { packets:physical?.construction?.stats?.sefirosPackets || 0, backend:physical?.construction?.sefirosRender?.legacySummary?.backend || null }; }
