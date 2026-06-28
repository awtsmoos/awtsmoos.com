// B"H
const Commander = require('./instructions/commander.js');
function pct(done, total) { return total ? Math.max(0, Math.min(100, Math.round((done / total) * 100))) : 0; }
function nextAction(out = {}) { return out.mustCallNext?.action || out.next?.mustCallNext?.action || ''; }
function issues(out = {}) { return out.releaseCourt?.issues || out.releaseIssues || out.issues || []; }
function phase(out = {}) {
  const action = String(out.action || ''), next = nextAction(out);
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
  if (out.whyStopDenied) soft.push(out.whyStopDenied);
  return { hard, soft };
}
function chosenReason(out = {}) {
  const next = nextAction(out) || 'missionDaemonTick';
  const map = {
    missionBootResume: 'The mission id or lock may be stale, so boot/resume must rebuild a coherent next action.',
    missionExecuteNext8: 'A next8 round still has pending recovery steps.',
    missionReviewNext8Step: 'The executed step needs review before the next transition.',
    missionRepeatBetter: 'The previous round needs another improvement pass, unless the loop escalates to boot resume.',
    missionDaemonTick: 'The mission remains locked and must continue automatically.',
    missionQueueComplete: 'Finalization was blocked and a completion-debt queue item must be resolved.'
  };
  return map[next] || 'The mission lock selected the next required state-machine action.';
}
function loopWarning(out = {}) {
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
    'THEN: INSPECT, PLAN, BRAINSTORM, IMPLEMENT, VERIFY, RECORD PROOF, AND FIND MORE WORK.',
    'STOP ONLY IF USER CANCELS, SAFETY BLOCKS, OR FINALANSWERALLOWED IS TRUE.'
  ];
}
function releasePath() {
  return {
    successLooksLike: ['durable progress recorded', 'blocker converted into next task', 'verification attempted', 'next improvement identified', 'continuation proceeds'],
    recoveryAdvice: ['CALL MUSTCALLNEXT EXACTLY WHEN PRESENT.', 'USE MISSIONBOOTRESUME FOR MISSING MISSION IDS.', 'USE MISSIONDAEMONTICK WHEN NO BETTER NEXT ACTION EXISTS.', 'DO SAFE MISSION-SCOPE WORK WITHOUT ASKING FOR ANOTHER PUSH.']
  };
}
function explain(out = {}) {
  const bl = blockers(out);
  const next = out.mustCallNext || out.next?.mustCallNext || { action: nextAction(out) || 'missionDaemonTick' };
  const reason = out.releaseExplanation || out.reason || out.error || chosenReason(out);
  return {
    phase: phase(out), locked: out.mustContinue === true || out.finalAnswerAllowed === false, reason,
    chosenAction: nextAction(out) || next.action || '', chosenReason: chosenReason(out), progress: progress(out), blockers: bl,
    hardBlockers: bl.hard, softBlockers: bl.soft, loopWarning: loopWarning(out),
    plainEnglishAllCaps: Commander.text(out, next, reason),
    operatingRules: Commander.operatingRules(out, next, reason),
    productiveWorkAllowed: true, fullControlInsideMissionScope: true,
    whatToDoNext: plainEnglishNext(out, next),
    decisionTree: [
      { action: 'missionFinalize', verdict: out.finalAnswerAllowed ? 'ALLOWED' : 'REJECTED', reason: out.releaseExplanation || 'MISSION STILL REQUIRES CONTINUATION' },
      { action: 'mission-scope work', verdict: 'ALLOWED', reason: 'PLANNING, FILE MAPPING, IMPLEMENTATION, VERIFICATION, AND HISTORY RECORDING ARE PRODUCTIVE CONTINUATION' },
      { action: 'mustCallNext', verdict: out.mustCallNext ? 'CHOSEN' : 'FALLBACK_WHEN_NEEDED', reason: chosenReason(out) },
      { action: 'missionDaemonTick', verdict: out.mustContinue ? 'FALLBACK' : 'NOT_NEEDED', reason: 'DAEMON CONTINUATION KEEPS THE LOCK ALIVE WHEN NO BETTER NEXT ACTION EXISTS' }
    ], ...releasePath()
  };
}
module.exports = { explain, phase, progress, blockers, chosenReason, loopWarning, plainEnglishNext };
