// B"H
const Size = require('./size.js');
const S = require('./summary.js');
const Minimal = require('../minimalResponse/slim.js');
const Diagnostics = require('../diagnostics.js');
function missionId(out = {}) { return out.missionId || out.mission?.id || out.report?.id || out.scheduler?.missionId || ''; }
function wantsFull(payload = {}) { return payload.fullResponse === true || payload.fullResponse === 'true' || payload.diagnostics === true || payload.diagnostics === 'true'; }
function should(out = {}, payload = {}) {
  if (wantsFull(payload)) return false;
  return String(out.action || payload.action || '').startsWith('mission') || out.mustCallNext || out.nextSuggestedToolCall || out.mustContinue === true || out.finalAnswerAllowed === false;
}
function nextSummary(out = {}) { const n = out.next; return n ? { keepGoing: !!n.keepGoing, verdict: n.verdict || '', messageToAgent: n.messageToAgent || '' } : undefined; }
function hardGate(out = {}) { return out.mustContinue === true || out.finalAnswerAllowed === false || out.userVisibleAnswerBlocked === true || !!out.nextRequiredToolCall; }
function suggested(out = {}) { return out.nextSuggestedToolCall || out.next?.mustCallNext || out.mustCallNext || null; }
function compact(out = {}, payload = {}) {
  if (!should(out, payload)) return out;
  const c = Minimal.slim(out);
  const action = out.action || payload.action || '';
  const hard = hardGate(out);
  const next = suggested(out);
  c.ok = out.ok !== false;
  c.action = action;
  c.requestAction = out.requestAction || payload.action || action;
  c.actualAction = out.actualAction || action;
  c.missionId ||= missionId(out);
  if (out.finalAnswerAllowed !== undefined) c.finalAnswerAllowed = out.finalAnswerAllowed !== false;
  c.mustContinue = out.mustContinue === true;
  if (hard) {
    c.mustCallNext ||= out.next?.mustCallNext || out.mustCallNext;
    c.nextRequiredToolCall ||= out.nextRequiredToolCall || c.mustCallNext;
  } else {
    delete c.mustCallNext;
    delete c.nextRequiredToolCall;
    if (next) c.nextSuggestedToolCall = next;
  }
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
  c.responseFocus ||= { continuationRequired: c.mustContinue, finalAnswerBlocked: c.finalAnswerAllowed === false, nextRequiredToolCall: c.nextRequiredToolCall, nextSuggestedToolCall:c.nextSuggestedToolCall };
  c.responseShape = 'focused-mission-v7-concise';
  if (Size.tooLarge(c)) return Minimal.slim(c);
  return c;
}
function conciseExplanation(d = {}) {
  return { phase: d.phase, locked: d.locked, reason: d.reason, chosenAction: d.chosenAction, chosenReason: d.chosenReason, progress: d.progress, blockers: d.blockers, whatToDoNext: d.whatToDoNext };
}
module.exports = { compact, should, wantsFull, conciseExplanation, hardGate };
