// B"H
/**
 * B"H
 * Chapter 624: The running command became a guarded doorway.
 * The agent does not trample a job in flight; it bows, records, and returns
 * when the command breath has become proof.
 */
function state(input = {}) {
  const jobId = input.jobId || input.commandJobId || input.runningJobId || '';
  const raw = String(input.commandStatus || input.jobStatus || input.status || '').toLowerCase();
  const done = input.jobDone === true || input.commandDone === true || input.commandComplete === true || ['done', 'complete', 'completed', 'success', 'failed', 'exited'].includes(raw);
  const running = !!jobId && !done && raw !== 'not_running';
  return { jobId, status: raw || (jobId ? 'running' : 'none'), done, running };
}
function shouldSuspend(input = {}, policy = {}) {
  const s = state(input);
  return policy.pauseOnCommand !== false && s.running;
}
function receipt(input = {}, policy = {}, m = {}) {
  const s = state(input);
  return { id: `cmd_suspend_${Date.now().toString(36)}`, at: new Date().toISOString(), missionId: m.id || '', roomId: m.room?.id || '', kind: 'command_suspended', jobId: s.jobId, status: s.status, resumeToken: policy.resumeToken || input.resumeToken || '', note: input.commandNote || input.note || 'scheduler suspended around running command job' };
}
module.exports = { state, shouldSuspend, receipt };
