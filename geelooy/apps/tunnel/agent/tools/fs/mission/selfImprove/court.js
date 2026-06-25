// B"H
function verdict(m, env = {}) {
  const policy = m.selfImprovement?.policy || env.policy.defaults({});
  const ledger = env.ledger.status(m);
  const novelty = env.novelty.status(m);
  const boredom = env.boredom.check(m, { noveltyScore: novelty.recent.at(-1)?.score || 0 });
  const mergeCourtPasses = (m.room?.mergeCourts || []).filter(x => x.ok).length;
  return env.policy.verdict({ policy, cycles: (m.selfImproveReceipts || []).length, innovations: ledger.total, noveltyScore: novelty.totalScore, mergeCourtPasses, boredom });
}
function next(m, v) {
  const issue = v.issues?.[0];
  if (issue === 'boredom_detected') return { action: 'missionSelfImprovePulse', missionId: m.id, forceBrainstorm: true };
  if (issue === 'merge_court_passes_required') return { action: 'missionRoomMergeCourt', missionId: m.id };
  return { action: 'missionSelfImprovePulse', missionId: m.id };
}
module.exports = { verdict, next };
