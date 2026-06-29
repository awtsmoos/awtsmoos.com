// B"H
/**
 * B"H
 * Chapter 619: The scheduler wrote footprints in fire.
 * Every run must leave a receipt, because a loop without memory is smoke.
 */
function start(policy, input = {}, m = {}) {
  return { id: id('scheduler'), at: now(), missionId: m.id || '', roomId: m.room?.id || '', kind: 'scheduler_start', policy, resumeToken: policy.resumeToken || input.resumeToken || '' };
}
function finish(startReceipt, runs, court, reason) {
  return { id: startReceipt.id, at: startReceipt.at, endedAt: now(), kind: 'scheduler_finish', missionId: startReceipt.missionId, roomId: startReceipt.roomId, runs: runs.length, pulses: runs.reduce((a, r) => a + Number(r.pulses || 0), 0), reason, court };
}
function checkpoint(index, run, court, reason) {
  return { id: id('scheduler_checkpoint'), at: now(), kind: 'scheduler_checkpoint', index, runId: run.runReceipt?.id || '', pulses: run.pulses || 0, reason, court };
}
function status(m) { return { count: (m.selfImproveSchedulerRuns || []).length, recent: (m.selfImproveSchedulerRuns || []).slice(-10) }; }
function id(prefix) { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 8)}`; }
function now() { return new Date().toISOString(); }
module.exports = { start, finish, checkpoint, status };
