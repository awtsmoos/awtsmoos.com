// B"H
const M = require('./core.js');
const X = require('./expansion.js');

function text(m) {
  return JSON.stringify({
    goal: m.goal, tasks: m.tasks, evidence: m.evidence,
    blockers: m.blockers, discoveries: m.discoveries, events: m.events
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
    .filter(name => body.includes(name) && !body.includes(`${name}:resolved`))
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
  const events = (m.events || []).slice(-12).map(e => e.type + ':' + e.message);
  const unique = new Set(events).size;
  return { repeated: events.length - unique, stagnant: events.length >= 8 && unique <= 3 };
}

function nextAction(m, verdict) {
  if (verdict.blocked) return { action: 'missionAgentSync', missionId: m.id, blockOnUserMessage: true };
  if (verdict.evidenceDebt.length) return { action: 'missionEvidenceDebt', missionId: m.id };
  if (verdict.discoveryDebt.length) return { action: 'missionDiscover', missionId: m.id };
  if (!M.verify(m).ok) return { action: 'missionNext', missionId: m.id, auto: true };
  if (verdict.confidence.score < 85) return { action: 'missionImprovementPlan', missionId: m.id };
  return { action: 'missionVerify', missionId: m.id, expand: false };
}

/**
 * B"H
 * Chapter 541: The court that keeps the candle burning without hallucinating.
 * It does not loop forever. It keeps going while proof, discovery, confidence,
 * or blocking gates demand more work, and it permits rest only after evidence.
 */
function court(m, input = {}) {
  const verify = M.verify(m);
  const ed = evidenceDebt(m);
  const dd = discoveryDebt(m);
  const conf = confidence(m);
  const ent = entropy(m);
  const userMessages = m.collaboration?.openUserMessages || m.collaboration?.userMessages || [];
  const blocked = userMessages.some(x => x.requiresResponse && x.status === 'open') || false;
  const issues = [];
  if (!verify.ok) issues.push(...verify.issues, 'definition_of_done_not_court_approved');
  if (ed.length) issues.push('evidence_debt');
  if (dd.length) issues.push('discovery_debt');
  if (conf.score < Number(input.minConfidence || 85)) issues.push('low_confidence');
  if (ent.stagnant) issues.push('entropy_stagnation');
  if (blocked) issues.push('blocking_user_message');
  const ok = issues.length === 0;
  const verdict = { ok, blocked, verification: verify, evidenceDebt: ed, discoveryDebt: dd, confidence: conf, entropy: ent, issues };
  verdict.mustCallNext = ok ? { action: 'missionHeartbeat', missionId: m.id, note: 'court approved' } : nextAction(m, verdict);
  verdict.finalAnswerAllowed = ok;
  verdict.mustContinue = !ok;
  verdict.responseFocus = {
    oneMainThing: ok ? 'Mission court approved completion with proof.' : 'Continue the court-mandated mission action before unrelated work.',
    mustAnswerGate: !ok,
    expectedAction: verdict.mustCallNext.action,
    recommendedAnswer: ok ? 'Report completion with evidence.' : 'Call mustCallNext and continue with proof.'
  };
  return verdict;
}

function spawnMissions(m, input = {}) {
  const verdict = court(m, input);
  const seeds = [...verdict.discoveryDebt, ...verdict.evidenceDebt].slice(0, Number(input.limit || 5));
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
    openUserMessages: m.collaboration?.openUserMessages || []
  };
}

module.exports = { court, evidenceDebt, discoveryDebt, confidence, entropy, spawnMissions, heartbeat, recovery };
