// B"H
/**
 * @file UniverseMigrationReport.js
 * @purpose Declare the live universe construction migration contract.
 * @owner mitzvahWorld universe construction diagnostic layer.
 * @inputs Optional overrides from tests or runtime diagnostics.
 * @outputs JSON-safe migration status for construction plan reports.
 * @runtimeAuthority Report only; migration execution is handled by bridge modules.
 * @updateOrder Run with command and Sefiros reports before plan stats are emitted.
 * @callers systems/universe/UniverseConstructionPlan.js.
 * @invariants This module never changes commands, scene, workers, or storage.
 * @failureModes Missing overrides produce the stable live migration contract.
 */
export function universeMigrationReport(overrides = {}) {
  return {
    ok: true,
    source: "UniverseConstructionPlan",
    migration: "json_commands_to_sefiros_runtime_packets",
    staticModule: true,
    serverRouteRequired: false,
    bridgeAuthority: overrides.bridgeAuthority || "SefirosRuntimeBridge",
    commandAuthority: overrides.commandAuthority || "UniverseConstructionPlan",
    renderNeutral: overrides.renderNeutral !== false,
    notes: overrides.notes || [
      "Runtime JSON commands are summarized before bridge installation.",
      "Scene mutation stays outside report modules."
    ]
  };
}

export default universeMigrationReport;
