// B"H
const Covenant = require('./continuationCovenant.js');
function policy(m = {}) { return m.finalizationPolicy || {}; }
function minCycles(m) { return Number(policy(m).minimumProductiveCycles ?? 12); }
function minMs(m) { return Number(policy(m).minimumProductiveMs ?? m.innovationPolicy?.minimumWorkWindowMs ?? 3600000); }
function protocolNeeded(m) { return m.bossProtocol?.enabled === true; }
function selfImproveNeeded(m) { return m.selfImprovement?.policy?.enabled === true; }
function verdict(m, input = {}, env) {
  const issues = [];
  const verify = env.verify(m);
  const queue = env.ContinuationQueue.status(m);
  const cycles = env.CycleArtifacts.status(m);
  const protocol = protocolNeeded(m) ? env.ProtocolFinalizationGuard.verdict(m, env) : { ok: true, issues: [], status: null };
  const selfImprove = selfImproveNeeded(m) && env.selfImproveCourt ? env.selfImproveCourt(m) : { ok: true, issues: [] };
  const requiredCycles = Number(input.minimumProductiveCycles ?? minCycles(m));
  const requiredMs = Number(input.minimumProductiveMs ?? minMs(m));
  const completionGateOk = verify.ok && queue.requiredOpen === 0 && protocol.ok && selfImprove.ok;
  const innovation = env.Innovation.assess(m, { completionGateOk });
  if (!verify.ok) issues.push(...verify.issues, 'verification_not_ok');
  if (queue.requiredOpen > 0) issues.push('continuation_queue_required_open');
  if (cycles.complete < requiredCycles) issues.push('minimum_productive_cycles');
  if (cycles.productiveMs < requiredMs) issues.push('minimum_productive_time');
  if (!protocol.ok) issues.push(...protocol.issues);
  if (!selfImprove.ok) issues.push(...selfImprove.issues.map(x => `self_improve_${x}`));
  if (!innovation.finalAnswerAllowed) issues.push(innovation.reason);
  const exception = Covenant.exceptionStop(input);
  if (!exception) issues.push(...Covenant.releaseIssues(m, input));
  const uniqueIssues = [...new Set(issues.filter(Boolean))];
  const ok = Boolean(exception) || uniqueIssues.length === 0;
  const covenant = ok ? releaseCovenant(m, input, exception) : Covenant.blockedResponse(m, { issues: uniqueIssues }, mustCallNext(m, { queue, protocol, selfImprove, issues: uniqueIssues }));
  return {
    ok,
    finalAnswerAllowed: ok,
    mustContinue: !ok,
    issues: uniqueIssues,
    verification: verify,
    queue,
    cycles,
    protocol,
    selfImprove,
    innovation,
    covenant,
    plainEnglish: covenant.plainEnglish,
    checkpointMessage: covenant.checkpointMessage,
    required: { minimumProductiveCycles: requiredCycles, minimumProductiveMs: requiredMs },
    stopReason: exception || (ok ? 'user_approved_release_and_debt_clear' : '')
  };
}
function releaseCovenant(m, input, exception) {
  if (exception) return { checkpointMessage: `MISSION STOP EXCEPTION: ${exception}.`, plainEnglish: Covenant.PLAIN_ENGLISH, exception };
  return {
    checkpointMessage: 'USER-APPROVED RELEASE. FINAL ANSWER MAY BE GIVEN.',
    plainEnglish: ['USER APPROVED RELEASE.', 'ALL RELEASE DEBT IS CLEAR.', 'FINAL ANSWER IS ALLOWED.'],
    releaseApprovedByUser: Covenant.approved(m, input)
  };
}
function mustCallNext(m, v = {}) {
  if (v.protocol && !v.protocol.ok) return { action: 'missionProtocolNext', missionId: m.id };
  if (v.selfImprove && !v.selfImprove.ok) return { action: 'missionSelfImprovePulse', missionId: m.id };
  if (v.queue?.next) return { action: 'missionQueueComplete', missionId: m.id, queueId: v.queue.next.id, proof: 'complete this continuation debt with evidence' };
  return {
    action: 'missionCycle',
    missionId: m.id,
    inspection: 'inspect remaining finalization blockers',
    plan: 'resolve blocker or discover next work',
    verification: 'run proof from real files, commands, browser, or docs',
    selfCritique: 'explain remaining risk before release',
    nextIdeas: ['continue hardening', 'review dependencies', 'run tests', 'generate docs']
  };
}
module.exports = { verdict, mustCallNext };
