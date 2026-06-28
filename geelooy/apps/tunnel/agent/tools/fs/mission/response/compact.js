// B"H
const Size = require('./size.js');
const S = require('./summary.js');
const Minimal = require('../minimalResponse/slim.js');
const Capsule = require('../instructions/capsule.js');
const Diagnostics = require('../diagnostics.js');
function missionId(out = {}) { return out.missionId || out.mission?.id || out.report?.id || out.scheduler?.missionId || out.receipt?.missionId || ''; }
function should(out = {}, payload = {}) {
  if (payload.fullResponse === true || payload.fullResponse === 'true') return false;
  return String(out.action || payload.action || '').startsWith('mission') || out.mustCallNext || out.mustContinue === true || out.finalAnswerAllowed === false;
}
function nextSummary(out = {}) { const n = out.next; return n ? { keepGoing: !!n.keepGoing, verdict: n.verdict || '', messageToAgent: n.messageToAgent || '' } : undefined; }
function compact(out = {}, payload = {}) {
  if (!should(out, payload)) return out;
  const c = Minimal.slim(out);
  c.ok = out.ok !== false;
  c.action ||= out.action || payload.action;
  c.missionId ||= missionId(out);
  c.finalAnswerAllowed = out.finalAnswerAllowed === true;
  c.mustContinue = out.mustContinue !== false && c.finalAnswerAllowed !== true;
  if (!c.mustCallNext && out.next?.mustCallNext) c.mustCallNext = out.next.mustCallNext;
  if (!c.mustCallNext && out.mustCallNext) c.mustCallNext = out.mustCallNext;
  c.next = nextSummary(out);
  c.round = S.slimRound(out.round);
  c.step = S.slimStep(out.step);
  c.nextStep = S.slimStep(out.nextStep);
  c.missionExplanation ||= Diagnostics.explain({ ...out, ...c });
  c.missionOperatingRules ||= c.missionExplanation.operatingRules;
  c.plainEnglishAllCaps ||= c.missionExplanation.plainEnglishAllCaps;
  c.responseShape = 'focused-mission-v5-plain-english';
  const withInstruction = Capsule.attach(c);
  if (Size.tooLarge(withInstruction)) return Minimal.slim(withInstruction);
  return withInstruction;
}
module.exports = { compact, should };
