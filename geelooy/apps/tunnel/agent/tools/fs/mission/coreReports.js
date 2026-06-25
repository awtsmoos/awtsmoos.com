// B"H

function createReports(env) {
  function continuation(m) {
    env.Lease.touch(m, { renew: true });
    const d = env.dod(m);
    const boss = bossStatus(m);
    const selfImprove = selfImproveStatus(m);
    const selfOk = !selfImprove.enabled || selfImprove.court.ok;
    const completionGateOk = m.status === 'done' && d.ok && (!boss.enabled || boss.finalizationReady) && selfOk;
    const innovation = env.Innovation.assess(m, { completionGateOk });
    if (m.status === 'blocked') return { continueWorking: false, reason: 'mission_blocked', dod: d, innovation, bossProtocol: boss, selfImprovement: selfImprove };
    if (completionGateOk && innovation.finalAnswerAllowed) return { continueWorking: false, reason: 'mission_done', dod: d, innovation, bossProtocol: boss, selfImprovement: selfImprove };
    return { continueWorking: true, reason: nextReason(d, boss, selfImprove, innovation), dod: d, innovation, bossProtocol: boss, selfImprovement: selfImprove, nextPrompt: 'Keep going: inspect, execute, verify, record evidence, self-critique, generate improvements, then reassess.' };
  }
  function nextReason(d, boss, selfImprove, innovation) {
    if (boss.enabled && !boss.finalizationReady) return 'boss_protocol_not_complete';
    if (selfImprove.enabled && !selfImprove.court.ok) return 'self_improvement_not_complete';
    if (d.ok && !innovation.finalAnswerAllowed) return innovation.reason;
    return d.ok ? 'ready_for_completion_court' : 'definition_of_done_not_satisfied';
  }
  function bossStatus(m) {
    if (!m.bossProtocol?.enabled || !env.protocolStatus) return { enabled: false, finalizationReady: true };
    const status = env.protocolStatus(m);
    const guard = env.ProtocolFinalizationGuard.verdict(m, env);
    return { enabled: true, finalizationReady: guard.ok, guard, status, nextRequiredAction: env.protocolNext(m), reminder: 'Boss protocol is active: reports are not final; keep executing protocol stages until missionFinalize passes.' };
  }
  function selfImproveStatus(m) {
    if (!env.selfImproveStatus) return { enabled: false, court: { ok: true } };
    const status = env.selfImproveStatus(m);
    return { enabled: m.selfImprovement?.policy?.enabled === true, ...status, nextRequiredAction: status.court.ok ? { action: 'missionSelfImproveCourt', missionId: m.id } : { action: 'missionSelfImprovePulse', missionId: m.id } };
  }
  function verify(m) {
    const d = env.dod(m);
    const issues = [];
    if (!m.tasks.length) issues.push('no_tasks');
    if (!m.evidence.length) issues.push('no_evidence');
    if (!m.questions.length) issues.push('no_self_questions');
    return { ok: d.ok && issues.length === 0, dod: d, issues };
  }
  function supervise(m) {
    const decision = continuation(m);
    return { ok: true, verdict: decision.continueWorking ? 'continue' : 'stop', decision, instruction: decision.continueWorking ? decision.nextPrompt : 'Mission may report completion.' };
  }
  function report(m) {
    const lease = env.Lease.status(m);
    const constitution = env.Constitution.review(m);
    return { id: m.id, goal: m.goal, status: m.status, phase: m.phase, counts: env.counts(m), stepProtocol: stepProtocol(m), bossProtocol: bossStatus(m), selfImprovement: selfImproveStatus(m), finalizationPolicy: m.finalizationPolicy || null, queue: env.queueStatus ? env.queueStatus(m) : null, cycleArtifacts: env.CycleArtifacts ? env.CycleArtifacts.status(m) : null, longRun: longRun(m), collaboration: collaboration(m), automation: m.automation, innovation: env.Innovation.assess(m, { completionGateOk: m.status === 'done' && env.dod(m).ok }), lease, constitution, continuation: continuation(m), updatedAt: m.updatedAt, heartbeatAt: m.heartbeatAt };
  }
  function stepProtocol(m) {
    return { stepPlans: (m.stepPlans || []).length, chunkPlans: (m.chunkPlans || []).length, refrigeratedStates: (m.refrigeratedStates || []).length, thawHistory: (m.thawHistory || []).length, nextPlans: (m.nextPlans || []).length };
  }
  function longRun(m) {
    return m.longRun ? { cycles: m.longRun.cycles || 0, queueOpen: (m.longRun.queue || []).filter(x => x.status !== 'done').length, familiesOpen: (m.longRun.families || []).filter(x => x.status !== 'done').length, pulses: (m.longRun.pulses || []).length, watchdog: (m.longRun.watchdog || []).length } : null;
  }
  function collaboration(m) {
    if (!m.collaboration) return null;
    return { projectId: m.collaboration.id, agents: Object.keys(m.collaboration.agents || {}).length, messages: (m.collaboration.messages || []).length, delegations: (m.collaboration.delegations || []).length, activeClaims: (m.collaboration.claims || []).filter(c => c.status === 'active').length, audits: (m.collaboration.audits || []).length };
  }
  function timeline(m) {
    return [...(m.events || []), ...(m.evidence || []).map(e => ({ at: e.at, type: 'evidence', msg: e.claim }))].sort((a, b) => String(a.at).localeCompare(String(b.at)));
  }
  function graph(m) {
    const nodes = [{ id: m.id, kind: 'mission', label: m.goal }], edges = [];
    for (const t of m.tasks) { nodes.push({ id: t.id, kind: 'task', label: t.title }); edges.push({ from: m.id, to: t.id, kind: 'has_task' }); }
    for (const e of m.evidence) { nodes.push({ id: e.id, kind: 'evidence', label: e.claim }); edges.push({ from: m.id, to: e.id, kind: 'has_evidence' }); }
    for (const j of m.jobs) { nodes.push({ id: j.id, kind: 'job', label: j.purpose }); edges.push({ from: m.id, to: j.id, kind: 'has_job' }); }
    return { nodes, edges };
  }
  return { continuation, verify, supervise, report, timeline, graph };
}

/**
 * B"H
 * Reports are mirrors, not exits. They now also reveal whether the self-
 * improvement spiral still has hidden light to uncover before any final word.
 */
module.exports = { createReports };
