// B"H
function run(m, input = {}, env) {
  m.summitHistory ||= [];
  const agents = Object.values(m.room?.agents || {}).map(a => a.agentId || a.name).filter(Boolean);
  const ledger = env.ledger.status(m);
  const novelty = env.novelty.status(m);
  const summit = { id: `summit_${Date.now().toString(36)}`, at: new Date().toISOString(), agents, ledger, novelty, nextHourPlan: plan(ledger, novelty), status: 'complete' };
  m.summitHistory.push(summit);
  env.ledger.add(m, { category: 'agent_coordination', ideas: summit.nextHourPlan });
  return { ok: true, summit, mustCallNext: { action: 'missionSelfImprovePulse', missionId: m.id }, finalAnswerAllowed: false };
}
function plan(ledger, novelty) {
  return [`Raise open innovation count beyond ${ledger.total}`, `Add novelty beyond score ${novelty.totalScore}`, 'Resolve stale agents, file conflicts, and open interrupts', 'Run merge court after the next proof cycle'];
}
function status(m) { return { count: (m.summitHistory || []).length, recent: (m.summitHistory || []).slice(-5) }; }
module.exports = { run, status };
