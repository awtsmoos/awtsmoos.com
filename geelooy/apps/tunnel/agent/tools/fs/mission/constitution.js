// B"H

function count(m, name) { return (m[name] || []).length; }
function openTasks(m) { return (m.tasks || []).filter(t => t.status !== 'done'); }
function latestEvents(m, n = 12) { return (m.events || []).slice(-n); }
function hasEvent(m, pattern) {
  return latestEvents(m, 80).some(e => pattern.test(`${e.type || ''} ${e.msg || ''} ${e.message || ''}`));
}
function evidenceDebt(m) {
  const missing = [];
  for (const task of m.tasks || []) {
    if (task.status === 'done' && !(task.evidence || []).length) missing.push(`task:${task.id}`);
  }
  for (const ev of m.evidence || []) {
    if (!ev.proof && ev.kind !== 'stress' && ev.kind !== 'test') missing.push(`evidence:${ev.id}`);
  }
  if (!(m.evidence || []).length) missing.push('mission:no-evidence');
  return missing;
}
function repeatedPlanning(m) {
  const sigs = latestEvents(m).map(e => `${e.type}:${e.msg || e.message || ''}`);
  return sigs.length >= 8 && new Set(sigs).size <= 3;
}
function entropy(m) {
  const open = openTasks(m).length;
  const debt = evidenceDebt(m).length;
  const unanswered = Math.max(0, count(m, 'questions') - count(m, 'answers'));
  const failed = latestEvents(m, 120).filter(e => /fail|error|regression/i.test(`${e.type} ${e.msg || ''}`)).length;
  const docs = hasEvent(m, /doc|schema|api/i) && !hasEvent(m, /doc.*done|documented|schema.*test/i) ? 1 : 0;
  const score = open * 25 + debt * 30 + unanswered * 10 + failed * 20 + docs * 15 + (repeatedPlanning(m) ? 40 : 0);
  return { score, openTasks: open, evidenceDebt: debt, unansweredQuestions: unanswered, failedSignals: failed, docDebt: docs, repeatedPlanning: repeatedPlanning(m) };
}

/**
 * B"H
 * Chapter 544: The mission stands before ten gates of light.
 * Completion is not a word. It is a constitution: proof, tests, docs, cleanup,
 * recovery, and one last humble question asking what more can be revealed.
 */
function review(m) {
  const e = entropy(m);
  const checks = [
    ['evidenceDebtClear', e.evidenceDebt === 0],
    ['verificationDebtClear', hasEvent(m, /verify|court|verification/i) || count(m, 'answers') > 0],
    ['technicalDebtConsidered', hasEvent(m, /debt|delta|review|court/i)],
    ['simplificationConsidered', hasEvent(m, /simpl|cleanup|review|improve/i)],
    ['documentationConsidered', hasEvent(m, /doc|handoff|checkpoint|schema/i)],
    ['testsConsidered', hasEvent(m, /test|verify|proof|evidence/i)],
    ['performanceConsidered', hasEvent(m, /performance|stress|loop|lease/i) || !hasEvent(m, /slow|timeout|504/i)],
    ['checkpointFresh', count(m, 'checkpoints') > 0 || hasEvent(m, /checkpoint|recovery/i)],
    ['recoveryFresh', hasEvent(m, /recovery|checkpoint|continuity/i)],
    ['nextIterationLowValue', e.score <= Number(m.constitution?.entropyThreshold || 25)]
  ].map(([name, ok]) => ({ name, ok }));
  const missing = checks.filter(c => !c.ok).map(c => c.name);
  const ok = missing.length === 0;
  m.constitution = { ...(m.constitution || {}), lastReviewAt: new Date().toISOString(), entropyThreshold: m.constitution?.entropyThreshold || 25, lastMissing: missing };
  return { ok, checks, missing, entropy: e };
}
function nextAction(m, verdict) {
  if (verdict.ok) return null;
  if (verdict.missing.includes('checkpointFresh')) return { action: 'missionLoopCheckpoint', missionId: m.id, reason: 'constitution_checkpoint' };
  if (verdict.missing.includes('recoveryFresh')) return { action: 'missionRecovery', missionId: m.id };
  if (verdict.missing.includes('documentationConsidered')) return { action: 'missionImprovementPlan', missionId: m.id, focus: 'documentation' };
  if (verdict.missing.includes('simplificationConsidered')) return { action: 'missionImprovementPlan', missionId: m.id, focus: 'simplification' };
  return { action: 'missionLoopPulse', missionId: m.id, auto: true };
}

module.exports = { entropy, review, nextAction, evidenceDebt };
