// B"H
function defaults(input = {}) {
  return {
    enabled: input.selfImprove === true || input.selfImprove === 'true',
    startedAt: new Date().toISOString(),
    minimumRuntimeMs: num(input.minimumRuntimeMs, 60 * 60 * 1000),
    minimumCycles: num(input.minimumSelfImproveCycles, 60),
    minimumInnovations: num(input.minimumInnovations, 120),
    minimumNoveltyScore: num(input.minimumNoveltyScore, 30),
    minimumMergeCourtPasses: num(input.minimumMergeCourtPasses, 1),
    summitEveryCycles: num(input.summitEveryCycles, 10)
  };
}
function num(v, d) { const n = Number(v); return Number.isFinite(n) ? n : d; }
function elapsed(policy) { return Math.max(0, Date.now() - Date.parse(policy.startedAt || new Date().toISOString())); }
function verdict(state = {}) {
  const p = state.policy || defaults({});
  const issues = [];
  if (elapsed(p) < p.minimumRuntimeMs) issues.push('minimum_runtime_not_met');
  if ((state.cycles || 0) < p.minimumCycles) issues.push('minimum_cycles_not_met');
  if ((state.innovations || 0) < p.minimumInnovations) issues.push('minimum_innovations_not_met');
  if ((state.noveltyScore || 0) < p.minimumNoveltyScore) issues.push('minimum_novelty_not_met');
  if ((state.mergeCourtPasses || 0) < p.minimumMergeCourtPasses) issues.push('merge_court_passes_required');
  if (state.boredom?.boring) issues.push('boredom_detected');
  return { ok: issues.length === 0, issues, elapsedMs: elapsed(p), policy: p };
}
module.exports = { defaults, verdict, elapsed };
