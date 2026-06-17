// B"H
export function sefirosActiveInstallReport(physical = {}) { const c = physical.construction || {}; return { installed:Boolean(c.sefiros), packets:c.stats?.sefirosPackets || 0, backend:c.sefirosRender?.legacySummary?.backend || "none", noThreeInSefiros:true }; }
