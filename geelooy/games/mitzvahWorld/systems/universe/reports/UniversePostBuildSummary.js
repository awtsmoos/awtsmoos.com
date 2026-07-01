// B"H
/**
 * @file UniversePostBuildSummary.js
 * @purpose Merges universe postbuild reports into one loading-safe summary.
 * @owner Olam postbuild boot chain and world-state ledger event stream.
 * @inputs Runtime report, Sefiros report, policy report, and generated index.
 * @outputs A compact JSON-safe summary for readiness and diagnostics.
 * @runtimeAuthority Diagnostic aggregation only; no worker or scene mutation.
 * @updateOrder Last report step before ledger.set and ledger.event calls.
 * @callers UniverseJsonPostBuild.js in the live mitzvahWorld import graph.
 * @invariants Missing subreports remain visible instead of throwing.
 * @failureModes Unknown index shapes report indexedTotal:0.
 */

export function universePostBuildSummary({ runtime, sefiros, policy, index } = {}) {
  return {
    ok: Boolean(runtime?.ok && sefiros?.ok && policy?.ok),
    stage: "movie_universe_postbuild",
    worldId: runtime?.worldId || null,
    title: runtime?.title || null,
    counts: runtime?.counts || {},
    commandTypes: runtime?.commandTypes || {},
    sefiros: {
      planId: sefiros?.planId || null,
      packets: sefiros?.sefirosPackets || 0,
      appliedCommands: sefiros?.appliedCommands || 0
    },
    policy: policy?.policy || "missing_policy_report",
    indexedTotal: Number(index?.total || 0),
    indexedTypes: index?.byType || {}
  };
}

export default universePostBuildSummary;
