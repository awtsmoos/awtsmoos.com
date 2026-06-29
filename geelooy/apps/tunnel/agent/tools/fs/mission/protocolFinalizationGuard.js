// B"H
function verdict(m, env) {
  const p = m.bossProtocol || {};
  const status = env.BossProtocol?.status ? env.BossProtocol.status(m) : env.protocolStatus(m);
  const issues = [];
  if (!p.enabled) issues.push('boss_protocol_not_started');
  if (status.completedCycles < (p.minimumCycles || 12)) issues.push('minimum_protocol_cycles');
  if (status.currentCycleComplete === false && status.currentCycle <= (p.minimumCycles || 12)) issues.push('current_protocol_cycle_incomplete');
  if (status.latestGateAnswered !== true) issues.push('latest_protocol_gate_unanswered');
  return { ok: issues.length === 0, issues, status };
}
module.exports = { verdict };
