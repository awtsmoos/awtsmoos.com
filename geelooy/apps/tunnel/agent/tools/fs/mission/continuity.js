// B"H
const M = require('./core.js');
const Lease = require('./lease.js');
const Constitution = require('./constitution.js');
const Innovation = require('./innovationPolicy.js');

function text(m) {
  return JSON.stringify({
    goal: m.goal,
    tasks: m.tasks,
    evidence: m.evidence,
    blockers: m.blockers,
    discoveries: m.discoveries
  }).toLowerCase();
}
function evidenceDebt(m) {
  const debt = [];
  for (const task of m.tasks || []) {
    if (task.status === 'done' && !(task.evidence || []).length) {
      debt.push({ kind: 'task-proof', taskId: task.id, need: `Attach proof for completed task: ${task.title}` });
    }
  }
  for (const ev of m.evidence || []) {
    if (!ev.proof && ev.kind !== 'stress' && ev.kind !== 'test') {
      debt.push({ kind: 'claim-proof', evidenceId: ev.id, need: `Add observed proof for claim: ${ev.claim}` });
    }
  }
  if (!(m.evidence || []).length) debt.push({ kind: 'missing-evidence', need: 'Record observed evidence before completion.' });
  return debt;
}
function discoveryDebt(m) {
  const body = text(m);
  const required = ['todo', 'failing test', 'regression', 'blocking', 'security', 'restart', 'stress'];
  return required
    .filter(name => new RegExp(`\\b${name}\\b`).test(body) && !new RegExp(`\\b${name}:resolved\\b`).test(body))
    .map(name => ({ kind: 'discovery', name, need: `Resolve or explicitly dismiss discovered ${name}.` }));
}
function confidence(m) {
  const c = M.counts(m);
  const task = c.totalTasks ? c.doneTasks / c.totalTasks : 0;
  const evidence = Math.min(1, c.evidence / Math.max(1, c.totalTasks));
  const question = Math.min(1, c.answers / Math.max(1, c.questions || 1));
  const score = Math.round(((task * 0.45) + (evidence * 0.35) + (question * 0.2)) * 100);
  return { score, task, evidence, question };
}
function entropy(m) {
  const events = (m.events || []).slice(-12).map(e => `${e.type}:${e.msg || e.message || ''}`);
  const unique = new Set(events).size;
  const constitution = Constitution.entropy(m);
  return { repeated: events.length - unique, stagnant: events.length >= 8 && unique <= 3, ...constitution };
}
function blockedByUser(m) {
  const userMessages = m.collaboration?.openUserMessages || m.collaboration?.userMessages || [];
  return userMessages.some(x => x.requiresResponse && x.status === 'open') || false;
}
function shouldEnforceConstitution(input = {}) {
  return input.enforceConstitution === true || input.enforceConstitution === 'true' || input.alwaysMore === true || input.alwaysMore === 'true';
}
function nextAction(m, verdict) {
  const leaseNext = Lease.nextAction(m);
  if (verdict.blocked) return { action: 'missionAgentSync', missionId: m.id, blockOnUserMessage: true };
  if (leaseNext) return leaseNext;
  if (verdict.evidenceDebt.length) return { action: 'missionEvidenceDebt', missionId: m.id };
  if (verdict.discoveryDebt.length) return { action: 'missionDiscover', missionId: m.id };
  if (!M.verify(m).ok) return { action: 'missionNext', missionId: m.id, auto: true };
  if (verdict.constitutionEnforced && !verdict.constitution.ok) return Constitution.nextAction(m, verdict.constitution);
  if (verdict.issues?.includes('minimum_innovation_window')) return { action: 'missionImprovementPlan', missionId: m.id, focus: 'minimum_innovation_window' };
  if (verdict.confidence.score < verdict.minConfidence) return { action: 'missionImprovementPlan', missionId: m.id };
  return { action: 'missionVerify', missionId: m.id, expand: false };
}

/**
 * B"H
 * Chapter 541: The court learned the hourglass is also a menorah.
 * A mission may finish only when proof is honest; and when long-run mode is
 * invoked, the constitution asks again: what more can be revealed before rest?
 */
function court(m, input = {}) {
  const verify = M.verify(m);
  const ed = evidenceDebt(m);
  const dd = discoveryDebt(m);
  const conf = confidence(m);
  const ent = entropy(m);
  const lease = Lease.status(m, input);
  const constitution = Constitution.review(m);
  const constitutionEnforced = shouldEnforceConstitution(input);
  const minConfidence = Number(input.minConfidence || 85);
  const blocked = blockedByUser(m);
  const issues = [];
  if (!verify.ok) issues.push(...verify.issues, 'definition_of_done_not_court_approved');
  if (ed.length) issues.push('evidence_debt');
  if (dd.length) issues.push('discovery_debt');
  if (conf.score < minConfidence) issues.push('low_confidence');
  if (ent.stagnant) issues.push('entropy_stagnation');
  if (lease.expired && !lease.canRenew) issues.push('lease_expired');
  if (lease.softDeadline && lease.canRenew) issues.push('lease_soft_deadline');
  if (constitutionEnforced && !constitution.ok) issues.push('constitution_debt');
  const innovation = Innovation.assess(m, { completionGateOk: issues.length === 0 && verify.ok });
  if (!innovation.finalAnswerAllowed && verify.ok && !ed.length && !dd.length && conf.score >= minConfidence) issues.push('minimum_innovation_window');
  if (blocked) issues.push('blocking_user_message');
  const ok = issues.length === 0;
  const verdict = { ok, blocked, verification: verify, evidenceDebt: ed, discoveryDebt: dd, confidence: conf, minConfidence, entropy: ent, lease, constitution, constitutionEnforced, innovation, issues };
  verdict.mustCallNext = ok ? { action: 'missionHeartbeat', missionId: m.id, note: 'court approved' } : nextAction(m, verdict);
  verdict.finalAnswerAllowed = ok;
  verdict.mustContinue = !ok;
  verdict.responseFocus = {
    oneMainThing: ok ? 'Mission court approved completion with proof.' : 'Continue the court-mandated mission action before unrelated work.',
    mustAnswerGate: !ok,
    expectedAction: verdict.mustCallNext.action,
    recommendedAnswer: ok ? 'Report completion with evidence.' : 'Call mustCallNext and continue with proof.',
    innovationContinuation: innovation
  };
  return verdict;
}
function spawnMissions(m, input = {}) {
  const verdict = court(m, input);
  const seeds = [
    ...verdict.discoveryDebt,
    ...verdict.evidenceDebt,
    ...(verdict.constitutionEnforced ? verdict.constitution.missing.map(name => ({ kind: 'constitution', need: `Satisfy constitution gate: ${name}` })) : [])
  ].slice(0, Number(input.limit || 5));
  m.spawnedMissions ||= [];
  const spawned = seeds.map(seed => {
    const child = { id: M.id('spawn'), parentMissionId: m.id, goal: seed.need, reason: seed.kind, status: 'proposed', createdAt: new Date().toISOString() };
    m.spawnedMissions.push(child);
    return child;
  });
  return { spawned, verdict };
}
function heartbeat(m, input = {}) {
  const verdict = court(m, input);
  const hb = { at: new Date().toISOString(), verdict, report: M.report(m), recovery: recovery(m) };
  m.continuityHeartbeats ||= [];
  m.continuityHeartbeats.push(hb);
  return hb;
}
function recovery(m) {
  return {
    missionId: m.id,
    status: m.status,
    next: M.continuation(m),
    unfinishedTasks: (m.tasks || []).filter(t => t.status !== 'done').map(t => t.id),
    openJobs: (m.jobs || []).filter(j => !j.finishedAt && j.status !== 'done').map(j => j.id),
    openUserMessages: m.collaboration?.openUserMessages || [],
    lease: Lease.status(m),
    entropy: Constitution.entropy(m),
    constitution: Constitution.review(m)
  };
}

module.exports = { court, evidenceDebt, discoveryDebt, confidence, entropy, spawnMissions, heartbeat, recovery };
