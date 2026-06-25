// B"H
const Policy = require('./schedulerPolicy.js');
const Receipts = require('./schedulerReceipts.js');
/**
 * B"H
 * Chapter 626: The scheduler learned to pause at a running command.
 * Awtsmoos makes the command breathe; the agent writes the breath, waits,
 * and resumes only when the job becomes evidence instead of storm.
 */
function run(m, input = {}, env) {
  const policy = Policy.normalize(input);
  const start = Receipts.start(policy, input, m);
  const runs = [];
  const checkpoints = [];
  let reason = 'max_runs_reached';
  const started = Date.now();
  if (env.commandSuspend?.shouldSuspend(input, policy)) {
    reason = 'command_suspended';
    checkpoints.push(env.commandSuspend.receipt(input, policy, m));
  }
  if (reason === 'max_runs_reached' && policy.pauseOnInterrupt && hasBlockingInterrupt(m)) reason = 'blocked_interrupt';
  for (let i = 0; reason === 'max_runs_reached' && i < policy.maxRuns; i++) {
    if (policy.windowMs && Date.now() - started > policy.windowMs) { reason = 'window_exhausted'; break; }
    const bounded = env.bounded.run(m, { ...input, maxPulses: policy.maxPulsesPerRun, focus: policy.focus, stopWhenCourtPasses: policy.stopWhenCourtPasses }, env);
    runs.push(bounded);
    const point = Receipts.checkpoint(i, bounded, bounded.court, bounded.reason);
    checkpoints.push(point);
    if (policy.summitEveryRuns > 0 && (i + 1) % policy.summitEveryRuns === 0) env.summit.run(m, input, env);
    if (policy.stopWhenCourtPasses && bounded.court?.ok) { reason = 'court_passed'; break; }
  }
  const court = env.court.verdict(m, env);
  const finish = Receipts.finish(start, runs, court, reason);
  m.selfImproveSchedulerRuns ||= [];
  m.selfImproveSchedulerRuns.push({ start, checkpoints, finish });
  return { ok: true, policy, start, checkpoints, finish, runs: runs.length, pulses: finish.pulses, reason, court, command: env.commandSuspend?.state(input), finalAnswerAllowed: court.ok && reason === 'court_passed', mustContinue: mustContinue(reason, court), mustCallNext: next(m, reason, court, env, policy) };
}
function hasBlockingInterrupt(m) { return (m.room?.interrupts || []).some(x => x.status === 'blocking'); }
function mustContinue(reason, court) { return !court.ok || reason === 'blocked_interrupt' || reason === 'command_suspended'; }
function next(m, reason, court, env, policy) {
  if (reason === 'command_suspended') return { action: m.room ? 'missionRoomSchedulerResume' : 'missionSelfImproveSchedulerResume', missionId: m.id, jobId: policy.jobId, commandStatus: 'completed' };
  if (reason === 'blocked_interrupt') return { action: 'missionRoomRecoverInterrupt', missionId: m.id };
  if (court.ok) return { action: 'missionSelfImproveCourt', missionId: m.id };
  return env.court.next(m, court);
}
module.exports = { run, status: Receipts.status };
