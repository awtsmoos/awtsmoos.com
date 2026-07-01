// B"H
/**
 * @file UniverseRuntimeReport.js
 * @purpose Summarizes the imported movie universe and runtime command stream.
 * @owner Olam postbuild boot chain for the live mitzvahWorld worker runtime.
 * @inputs Imported universe packet, runtime packet, and physical bridge packet.
 * @outputs A plain serializable report consumed by UniverseJsonPostBuild.
 * @runtimeAuthority Read-only diagnostics; never mutates scene, worker, or ledger.
 * @updateOrder Run after UniversePasteBridge and before postbuild summary.
 * @callers ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/UniverseJsonPostBuild.js.
 * @invariants Report stays JSON-safe and tolerates missing optional packets.
 * @failureModes Missing packets produce zero counts instead of import failure.
 */

function count(value) {
  return Array.isArray(value) ? value.length : 0;
}

function ids(rows = []) {
  return Array.isArray(rows) ? rows.map(row => row?.id).filter(Boolean) : [];
}

export function universeRuntimeReport({ imported = {}, runtime = {}, physical = {} } = {}) {
  const commands = Array.isArray(runtime.commands) ? runtime.commands : [];
  const construction = physical.construction || {};
  return {
    ok: true,
    source: "UniverseJsonPostBuild",
    worldId: imported.summary?.worldId || imported.world?.id || null,
    title: imported.summary?.title || imported.world?.title || null,
    counts: {
      regions: count(imported.regions),
      beings: count(imported.beings),
      buildings: count(imported.buildings),
      quests: count(imported.quests),
      cutscenes: count(imported.cutscenes),
      commands: commands.length,
      construction: count(construction.commands)
    },
    commandTypes: commands.reduce((acc, command) => {
      const key = command?.type || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
    ids: {
      regions: ids(imported.regions),
      beings: ids(imported.beings),
      buildings: ids(imported.buildings)
    }
  };
}

export default universeRuntimeReport;
