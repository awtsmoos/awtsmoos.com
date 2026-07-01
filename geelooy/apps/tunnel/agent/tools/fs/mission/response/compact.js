// B"H
const Size = require('./size.js');
const S = require('./summary.js');
const Minimal = require('../minimalResponse/slim.js');
const Diagnostics = require('../diagnostics.js');
function missionId(out = {}) { return out.missionId || out.mission?.id || out.report?.id || out.scheduler?.missionId || ''; }
function wantsFull(payload = {}) { return payload.fullResponse === true || payload.fullResponse === 'true' || payload.diagnostics === true || payload.diagnostics === 'true'; }
function should(out = {}, payload = {}) {
  if (wantsFull(payload)) return false;
  return String(out.action || payload.action || '').startsWith('mission') || out.mustCallNext || out.mustContinue === true || out.finalAnswerAllowed === false;
}
function nextSummary(out = {}) { const n = out.next; return n ? { keepGoing: !!n.keepGoing, verdict: n.verdict || '', messageToAgent: n.messageToAgent || '' } : undefined; }
function compact(out = {}, payload = {}) {
  if (!should(out, payload)) return out;
  const c = Minimal.slim(out);
  const action = out.action || payload.action || '';
  c.ok = out.ok !== false;
  c.action = action;
  c.requestAction = out.requestAction || payload.action || action;
  c.actualAction = out.actualAction || action;
  c.missionId ||= missionId(out);
  c.finalAnswerAllowed = out.finalAnswerAllowed === true;
  c.mustContinue = out.mustContinue !== false && c.finalAnswerAllowed !== true;
  c.mustCallNext ||= out.next?.mustCallNext || out.mustCallNext;
  c.nextRequiredToolCall ||= out.nextRequiredToolCall || c.mustCallNext;
  c.next = nextSummary(out);
  c.round = S.slimRound(out.round);
  c.step = S.slimStep(out.step);
  c.nextStep = S.slimStep(out.nextStep);
  c.workQueue = out.workQueue || out.round?.workQueueProgress || out.lock?.workQueue || null;
  c.liveActionToPerform = out.liveActionToPerform || null;
  c.fileWorkRequired = out.fileWorkRequired === true;
  c.debtShrank = out.debtShrank;
  c.filesTouched = out.filesTouched || [];
  c.testsRun = out.testsRun || 0;
  c.missionWorkLoop = out.missionWorkLoop || 'inspect -> plan -> write complete files -> verify -> review -> continue';
  const d = Diagnostics.explain({ ...out, ...c });
  c.missionExplanation = conciseExplanation(d);
  c.agentGuidance = out.agentGuidance || d.agentGuidance;
  c.responseFocus ||= { continuationRequired: c.mustContinue, finalAnswerBlocked: c.finalAnswerAllowed !== true, nextRequiredToolCall: c.nextRequiredToolCall };
  c.responseShape = 'focused-mission-v7-concise';
  if (Size.tooLarge(c)) return Minimal.slim(c);
  return c;
}
function conciseExplanation(d = {}) {
  return { phase: d.phase, locked: d.locked, reason: d.reason, chosenAction: d.chosenAction, chosenReason: d.chosenReason, progress: d.progress, blockers: d.blockers, whatToDoNext: d.whatToDoNext };
}
module.exports = { compact, should, wantsFull, conciseExplanation };
