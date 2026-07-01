// B"H
/**
 * @file SefirosRenderReport.js
 * @purpose Report the Sefiros render packet produced by the universe plan.
 * @owner mitzvahWorld universe construction diagnostic layer.
 * @inputs Sefiros render plan object returned by sefirosRenderGateway.
 * @outputs JSON-safe counts and packet authority metadata.
 * @runtimeAuthority Diagnostic only; render packet execution belongs elsewhere.
 * @updateOrder Run after sefirosRenderGateway and before construction plan return.
 * @callers systems/universe/UniverseConstructionPlan.js.
 * @invariants Never imports THREE and never executes render commands.
 * @failureModes Unknown packet shapes become explicit zero counts.
 */
function items(plan = {}) {
  const direct = plan?.sefiros?.items;
  const nested = plan?.sefiros?.sefiros?.items;
  const fallback = plan?.items;
  if (Array.isArray(direct)) return direct;
  if (Array.isArray(nested)) return nested;
  return Array.isArray(fallback) ? fallback : [];
}

function countBy(rows, picker) {
  return rows.reduce((acc, row) => {
    const key = picker(row) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export function sefirosRenderReport(plan = {}) {
  const packetItems = items(plan);
  return {
    ok: true,
    source: "SefirosRenderGateway",
    planId: plan?.id || plan?.planId || "sefiros_render_plan",
    sefirosPackets: packetItems.length,
    byType: countBy(packetItems, item => item?.type || item?.kind),
    ids: packetItems.map((item, index) => item?.id || `sefiros_${index}`),
    renderNeutral: true,
    authority: "SefirosRuntimeBridge"
  };
}

export default sefirosRenderReport;
