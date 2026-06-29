// B"H
const Policy = require('./schedulerPolicy.js');
const Receipts = require('./schedulerReceipts.js');
/**
 * B"H
 * Chapter 626: The scheduler learned to pause at a running command.
 * Chapter 627: The hour refused to be mistaken for a handful of pulses.
 *
 * The Awtsmoos makes time itself a vessel. A scheduler pass may be small,
 * because tools and prompts are finite, but when the self-improvement court
 * still says the one-hour runtime is unpaid, the pass must not pretend that
 * maxRuns is an ending. It writes the receipt, points to the next scheduler
 * turn, and the living loop keeps breathing until the hour opens.
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
  if (reason === 'max_runs_reached' && stillInsideHour(court)) reason = 'minimum_runtime_window_open';
  const finish = Receipts.finish(start, runs, court, reason);
  m.selfImproveSchedulerRuns ||= [];
  m.selfImproveSchedulerRuns.push({ start, checkpoints, finish });
  return { ok: true, policy, start, checkpoints, finish, runs: runs.length, pulses: finish.pulses, reason, court, command: env.commandSuspend?.state(input), finalAnswerAllowed: court.ok && reason === 'court_passed', mustContinue: mustContinue(reason, court), mustCallNext: next(m, reason, court, env, policy) };
}
function stillInsideHour(court = {}) { return (court.issues || []).includes('minimum_runtime_not_met'); }
function hasBlockingInterrupt(m) { return (m.room?.interrupts || []).some(x => x.status === 'blocking'); }
function mustContinue(reason, court) { return !court.ok || reason === 'blocked_interrupt' || reason === 'command_suspended' || reason === 'minimum_runtime_window_open'; }
function next(m, reason, court, env, policy) {
  if (reason === 'command_suspended') return { action: m.room ? 'missionRoomSchedulerResume' : 'missionSelfImproveSchedulerResume', missionId: m.id, jobId: policy.jobId, commandStatus: 'completed' };
  if (reason === 'blocked_interrupt') return { action: 'missionRoomRecoverInterrupt', missionId: m.id };
  if (reason === 'minimum_runtime_window_open') return { action: m.room ? 'missionRoomSchedulerRun' : 'missionSelfImproveSchedulerRun', missionId: m.id, windowMs: policy.windowMs, maxRuns: policy.maxRuns, maxPulsesPerRun: policy.maxPulsesPerRun, stopWhenCourtPasses: policy.stopWhenCourtPasses, reason: 'continue_until_minimum_runtime_met' };
  if (court.ok) return { action: 'missionSelfImproveCourt', missionId: m.id };
  return env.court.next(m, court);
}
module.exports = { run, status: Receipts.status };
