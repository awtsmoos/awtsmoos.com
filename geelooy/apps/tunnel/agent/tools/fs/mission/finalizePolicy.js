// B"H
function policy(m = {}) { return m.finalizationPolicy || {}; }
function minCycles(m) { return Number(policy(m).minimumProductiveCycles ?? 12); }
function minMs(m) { return Number(policy(m).minimumProductiveMs ?? m.innovationPolicy?.minimumWorkWindowMs ?? 3600000); }
function protocolNeeded(m){return m.bossProtocol?.enabled===true;}
function selfImproveNeeded(m){return m.selfImprovement?.policy?.enabled===true;}
function verdict(m, input = {}, env) {
  const issues = [];
  const verify = env.verify(m);
  const queue = env.ContinuationQueue.status(m);
  const cycles = env.CycleArtifacts.status(m);
  const protocol = protocolNeeded(m) ? env.ProtocolFinalizationGuard.verdict(m, env) : { ok: true, issues: [], status: null };
  const selfImprove = selfImproveNeeded(m) && env.selfImproveCourt ? env.selfImproveCourt(m) : { ok: true, issues: [] };
  const completionGateOk = verify.ok && queue.requiredOpen === 0 && protocol.ok && selfImprove.ok;
  const innovation = env.Innovation.assess(m, { completionGateOk });
  const requiredCycles = Number(input.minimumProductiveCycles ?? minCycles(m));
  const requiredMs = Number(input.minimumProductiveMs ?? minMs(m));
  if (!verify.ok) issues.push(...verify.issues, 'verification_not_ok');
  if (queue.requiredOpen > 0) issues.push('continuation_queue_required_open');
  if (cycles.complete < requiredCycles) issues.push('minimum_productive_cycles');
  if (cycles.productiveMs < requiredMs) issues.push('minimum_productive_time');
  if (!protocol.ok) issues.push(...protocol.issues);
  if (!selfImprove.ok) issues.push(...selfImprove.issues.map(x => `self_improve_${x}`));
  if (!innovation.finalAnswerAllowed) issues.push(innovation.reason);
  const emergency = input.userStop === true || input.safetyBlock === true || input.toolAccessLost === true;
  const ok = emergency || issues.length === 0;
  return { ok, finalAnswerAllowed: ok, mustContinue: !ok, issues: [...new Set(issues)], verification: verify, queue, cycles, protocol, selfImprove, innovation, required: { minimumProductiveCycles: requiredCycles, minimumProductiveMs: requiredMs }, stopReason: emergency ? 'exception_stop' : ok ? 'minimum_window_completed_and_debt_clear' : '' };
}
function mustCallNext(m, v) {
  if (v.protocol && !v.protocol.ok) return { action: 'missionProtocolNext', missionId: m.id };
  if (v.selfImprove && !v.selfImprove.ok) return { action: 'missionSelfImprovePulse', missionId: m.id };
  if (v.queue.next) return { action: 'missionQueueComplete', missionId: m.id, queueId: v.queue.next.id, proof: 'complete this continuation debt with evidence' };
  return { action: 'missionCycle', missionId: m.id, inspection: 'inspect remaining finalization blockers', plan: 'resolve blocker', verification: 'run proof', selfCritique: 'explain remaining risk', nextIdeas: ['continue hardening'] };
}
module.exports = { verdict, mustCallNext };
