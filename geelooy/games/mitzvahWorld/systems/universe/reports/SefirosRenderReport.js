// B"H
export function sefirosRenderReport(scenePlan = {}) { return { id:scenePlan.id || null, packets:scenePlan.sefiros?.items?.length || 0, kind:scenePlan.kind || null }; }
