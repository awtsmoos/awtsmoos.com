// B"H
/**
 * @file SefirosActiveInstallReport.js
 * @purpose Reports the active Sefiros render bridge install packet.
 * @owner Olam postbuild boot chain for render-neutral world construction.
 * @inputs Physical bridge packet returned by buildUniversePhysicalBridge.
 * @outputs A JSON-safe summary for ledgers and loading diagnostics.
 * @runtimeAuthority Diagnostic only; it does not install or mutate Sefiros state.
 * @updateOrder Run after physical bridge creation and before summary merge.
 * @callers UniverseJsonPostBuild.js inside the live mitzvahWorld Olam path.
 * @invariants Missing construction data becomes explicit zero/false values.
 * @failureModes Bad packet shapes return ok:false-like details without throwing.
 */

export function sefirosActiveInstallReport(physical = {}) {
  const construction = physical.construction || {};
  const stats = construction.stats || {};
  const applied = Array.isArray(physical.applied) ? physical.applied : [];
  return {
    ok: Boolean(construction),
    planId: construction.id || "sefiros_plan",
    appliedCommands: applied.length,
    sefirosPackets: stats.sefirosPackets || 0,
    renderPackets: stats.renderPackets || 0,
    hasConstruction: Boolean(physical.construction),
    hasApplicatorSnapshot: Boolean(physical.applicator),
    commandTypes: applied.reduce((acc, command) => {
      const key = command?.type || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  };
}

export default sefirosActiveInstallReport;
