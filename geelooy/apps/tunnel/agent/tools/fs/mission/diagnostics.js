// B"H
function pct(done, total) { return total ? Math.max(0, Math.min(100, Math.round((done / total) * 100))) : 0; }
function nextAction(out = {}) { return out.mustCallNext?.action || out.next?.mustCallNext?.action || ''; }
function issues(out = {}) { return out.releaseCourt?.issues || out.releaseIssues || out.issues || []; }
function phase(out = {}) {
  const action = String(out.action || ''), next = nextAction(out);
  if (out.bootResumeSelfLoop) return 'boot-resume-self-loop-diagnostics';
  if (/Finalize/.test(action) || out.releaseCourt) return 'release-court';
  if (/RepeatBetter/.test(action) || /RepeatBetter/.test(next)) return 'repeat-better';
  if (/ExecuteNext8|ReviewNext8|Next8/.test(action) || /ExecuteNext8|ReviewNext8|Next8/.test(next)) return 'next8-recovery';
  if (/Daemon/.test(action) || /Daemon/.test(next)) return 'daemon-continuation';
  return out.mustContinue ? 'locked-continuation' : 'normal';
}
function progress(out = {}) {
  const steps = out.round?.steps || [];
  const queue = out.workQueue || out.lock?.workQueue || null;
  const total = queue?.total || steps.length;
  const done = queue?.done || steps.filter(s => s.status === 'done').length;
  const blocked = queue?.blocked || steps.filter(s => s.status === 'blocked').length;
  return { done, blocked, total, percent: pct(done, total) };
}
function blockers(out = {}) {
  const hard = [], soft = [];
  for (const issue of issues(out)) soft.push(issue);
  if (out.error && !/missing|not_met|quota|repeat|verification/.test(String(out.error))) hard.push(out.error);
  if (out.blockedAction) hard.push('blocked_action:' + out.blockedAction);
  if (out.bootResumeSelfLoop) soft.push('missionBootResume repeated without progress');
  if (out.whyStopDenied) soft.push(out.whyStopDenied);
  return { hard, soft };
}
function chosenReason(out = {}) {
  const next = nextAction(out) || 'missionDaemonTick';
  const reasons = {
    missionBootResume: 'Repair or resume mission state.',
    missionExecuteNext8: 'A planned next8 step is still pending.',
    missionReviewNext8Step: 'Review the completed step before advancing.',
    missionRepeatBetter: 'Improve the previous pass with clearer evidence.',
    missionDaemonTick: 'Advance mission state when no narrower step is available.',
    missionQueueComplete: 'Resolve completion debt before final release.'
  };
  return reasons[next] || 'The mission lock selected the next safe state-machine action.';
}
function loopWarning(out = {}) {
  if (out.bootResumeSelfLoop) return 'Boot resume repeated; switch to diagnostics or daemon tick instead of looping.';
  const count = Number(out.loopCount || out.repeatCount || out.round?.index || out.round?.repeatCount || 0);
  const next = nextAction(out);
  if (count >= 3 && /missionRepeatBetter|missionExecuteNext8/.test(next || '')) return 'Repeated recovery cycle detected; continue only with visible progress evidence.';
  if (out.reason === 'loop_exhausted' && out.stopAllowed === false) return 'Loop budget ended, but the mission still requires a safe continuation decision.';
  return '';
}
function plainEnglishNext(out = {}, next = {}) {
  const action = next.action || nextAction(out) || '';
  return [
    `What happened: ${out.error || out.reason || 'mission checkpoint reached'}.`,
    `Original action preserved: ${out.requestAction || out.action || 'unknown'}.`,
    `Next action: ${action || 'none required'}.`,
    'Normal actions are allowed only when they are mission-safe, repair/status actions, or explicitly unlocked.',
    'Stop only for user cancel, safety, tool loss, fatal corruption, or finalAnswerAllowed:true.'
  ];
}
function releasePath() {
  return {
    successLooksLike: ['progress recorded', 'verification attempted', 'next action explicit', 'identity preserved'],
    recoveryAdvice: ['Call mustCallNext when present.', 'Use missionBootResume for stale state.', 'Use missionDaemonTick when no narrower mission action advances progress.']
  };
}
function workProgress(out = {}) {
  const q = out.workQueue || out.lock?.workQueue || out.round?.workQueueProgress || null;
  return q ? { workQueue: q, filesTouched: out.filesTouched || q.filesTouched || [], testsRun: out.testsRun || q.testsRun || 0, debtShrank: out.debtShrank === true } : { workQueue: null, filesTouched: out.filesTouched || [], testsRun: out.testsRun || 0, debtShrank: out.debtShrank === true };
}
function freedom() {
  return { productiveWorkAllowed: true, lockMeaning: 'Mission lock is guidance metadata, not a replacement action.' };
}
function explain(out = {}) {
  const bl = blockers(out);
  const next = out.mustCallNext || out.next?.mustCallNext || { action: nextAction(out) || '' };
  const reason = out.releaseExplanation || out.reason || out.error || chosenReason(out);
  return {
    phase: phase(out), locked: out.mustContinue === true || out.finalAnswerAllowed === false, reason,
    chosenAction: nextAction(out) || next.action || '', chosenReason: chosenReason(out), progress: progress(out), blockers: bl,
    hardBlockers: bl.hard, softBlockers: bl.soft, loopWarning: loopWarning(out), ...freedom(), ...workProgress(out),
    agentGuidance: { purpose: 'continue', plainEnglish: plainEnglishNext(out, next).join(' '), nextAction: next, originalActionPreserved: out.requestAction || out.action || '' },
    whatToDoNext: plainEnglishNext(out, next), operatingRules: { language: 'concise-plain-english', nextRequiredAction: next.action || '', keepIdentitySacred: true },
    ...releasePath()
  };
}
module.exports = { explain, phase, progress, blockers, chosenReason, loopWarning, plainEnglishNext, freedom, workProgress };
