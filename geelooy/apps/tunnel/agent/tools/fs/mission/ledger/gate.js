// B"H
/** B"H: completion is allowed by evidence, not by exhaustion. */
function completionGate(mission = {}) {
  const blockers = [];
  for (const c of mission.checkpoints || []) if (c.required !== false && c.status !== 'complete') blockers.push(`checkpoint:${c.checkpointId}`);
  for (const w of mission.workers || []) if (!['completed', 'cancelled', 'failed'].includes(w.state || w.status)) blockers.push(`worker:${w.workerId || w.jobId}`);
  if ((mission.unresolved || []).length) blockers.push('unresolved_items');
  if (mission.emergency && mission.emergency.status === 'active') blockers.push('emergency_active');
  return { ok: blockers.length === 0, blockers, checkedAt: new Date().toISOString() };
}
module.exports = { completionGate };
