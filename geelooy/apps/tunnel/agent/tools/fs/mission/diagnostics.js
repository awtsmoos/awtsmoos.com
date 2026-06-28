// B"H
const Commander = require('./instructions/commander.js');
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
  const done = steps.filter(s => s.status === 'done').length;
  const blocked = steps.filter(s => s.status === 'blocked').length;
  return { done, blocked, total: steps.length, percent: pct(done, steps.length) };
}
function blockers(out = {}) {
  const hard = [], soft = [];
  for (const issue of issues(out)) soft.push(issue);
  if (out.error && !/missing|not_met|quota|repeat|verification/.test(String(out.error))) hard.push(out.error);
  if (out.blockedAction) hard.push('blocked_action:' + out.blockedAction);
  if (out.bootResumeSelfLoop) soft.push('missionBootResume returned itself repeatedly');
  if (out.whyStopDenied) soft.push(out.whyStopDenied);
  return { hard, soft };
}
function chosenReason(out = {}) {
  const next = nextAction(out) || 'missionDaemonTick';
  const map = {
    missionBootResume: 'Boot/resume is repairing mission state. If it repeats without progress, the tunnel must diagnose and switch strategy.',
    missionExecuteNext8: 'A next8 round still has pending recovery steps.',
    missionReviewNext8Step: 'The executed step needs review before the next transition.',
    missionRepeatBetter: 'The previous round needs another improvement pass, unless the loop escalates.',
    missionDaemonTick: 'Daemon tick keeps the mission advancing when boot resume cannot make fresh progress.',
    missionQueueComplete: 'Finalization was blocked and a completion-debt queue item must be resolved.'
  };
  return map[next] || 'The mission lock selected the next required state-machine action.';
}
function loopWarning(out = {}) {
  if (out.bootResumeSelfLoop) return 'MISSIONBOOTRESUME_SELF_LOOP: boot resume repeated without a new action. The correct response is diagnostics plus missionDaemonTick, not passive stopping.';
  const count = Number(out.loopCount || out.repeatCount || out.round?.index || out.round?.repeatCount || 0);
  const next = nextAction(out);
  if (count >= 3 && /missionRepeatBetter|missionExecuteNext8/.test(next || '')) return 'POSSIBLE_RECURSIVE_RECOVERY_LOOP: repeated next8/repeatBetter cycle detected. Continue, but diagnose progress.';
  if (out.reason === 'loop_exhausted' && out.stopAllowed === false) return 'SOFT_LOOP_EXHAUSTED_BUT_LEASE_FORCES_CONTINUATION.';
  return '';
}
function plainEnglishNext(out = {}, next = {}) {
  return [
    'WHY: THE TUNNEL HAS NOT RELEASED THE MISSION.',
    `NEXT: CALL ${next.action || nextAction(out) || 'missionDaemonTick'}.`,
    'YOU HAVE ABSOLUTE FREEDOM INSIDE THE MISSION SYSTEM TO CHOOSE SAFE USEFUL WORK.',
    'THEN: INSPECT, PLAN, BRAINSTORM, IMPLEMENT, VERIFY, RECORD PROOF, AND FIND MORE WORK.',
    'STOP ONLY IF USER CANCELS, SAFETY BLOCKS, OR FINALANSWERALLOWED IS TRUE.'
  ];
}
function releasePath() {
  return {
    successLooksLike: ['durable progress recorded', 'blocker converted into next task', 'verification attempted', 'next improvement identified', 'continuation proceeds'],
    recoveryAdvice: ['CALL MUSTCALLNEXT EXACTLY WHEN PRESENT.', 'USE MISSIONBOOTRESUME FOR MISSING MISSION IDS.', 'USE MISSIONDAEMONTICK WHEN BOOT RESUME CANNOT MAKE NEW PROGRESS.', 'DO SAFE MISSION-SCOPE WORK WITHOUT ASKING FOR ANOTHER PUSH.']
  };
}
function workProgress(out = {}) {
  const q = out.workQueue || out.lock?.workQueue || out.round?.workQueueProgress || null;
  return q ? { workQueue: q, filesTouched: out.filesTouched || q.filesTouched || [], testsRun: out.testsRun || q.testsRun || 0, debtShrank: out.debtShrank === true } : { workQueue: null, filesTouched: out.filesTouched || [], testsRun: out.testsRun || 0, debtShrank: out.debtShrank === true };
}
function freedom() {
  return {
    absoluteMissionFreedomInsideMissionSystem: true,
    fullControlInsideMissionScope: true,
    doNotWaitForUserWhenSafeAndRelevant: true,
    lockMeaning: 'MISSION LOCK IS A ROUTER, NOT A WALL.',
    agentAuthority: ['inspect relevant files', 'choose implementation strategy', 'write complete files', 'run live tunnel actions', 'create diagnostics', 'continue until release']
  };
}
function explain(out = {}) {
  const bl = blockers(out);
  const next = out.mustCallNext || out.next?.mustCallNext || { action: nextAction(out) || 'missionDaemonTick' };
  const reason = out.releaseExplanation || out.reason || out.error || chosenReason(out);
  return {
    phase: phase(out), locked: out.mustContinue === true || out.finalAnswerAllowed === false, reason,
    chosenAction: nextAction(out) || next.action || '', chosenReason: chosenReason(out), progress: progress(out), blockers: bl,
    hardBlockers: bl.hard, softBlockers: bl.soft, loopWarning: loopWarning(out), ...freedom(), ...workProgress(out),
    plainEnglishAllCaps: Commander.text(out, next, reason), operatingRules: Commander.operatingRules(out, next, reason),
    productiveWorkAllowed: true, whatToDoNext: plainEnglishNext(out, next),
    decisionTree: [
      { action: 'missionFinalize', verdict: out.finalAnswerAllowed ? 'ALLOWED' : 'REJECTED', reason: out.releaseExplanation || 'MISSION STILL REQUIRES CONTINUATION' },
      { action: 'mission-scope work', verdict: 'ALLOWED', reason: 'THE USER DELEGATED SAFE RELEVANT IMPLEMENTATION CHOICES INSIDE THE MISSION SYSTEM' },
      { action: 'mustCallNext', verdict: out.mustCallNext ? 'CHOSEN' : 'FALLBACK_WHEN_NEEDED', reason: chosenReason(out) },
      { action: 'missionDaemonTick', verdict: out.mustContinue ? 'FALLBACK_OR_BOOT_LOOP_ESCAPE' : 'NOT_NEEDED', reason: 'DAEMON CONTINUATION KEEPS THE MISSION ALIVE WHEN BOOT RESUME CANNOT ADVANCE' }
    ], ...releasePath()
  };
}
module.exports = { explain, phase, progress, blockers, chosenReason, loopWarning, plainEnglishNext, freedom, workProgress };
