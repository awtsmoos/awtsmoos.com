// B"H
const Directive = require('../agentDirective.js');
const Commander = require('./commander.js');
function text(next = {}, reason = 'MISSION_LOCK_ACTIVE', out = {}) {
  return Commander.text(out, next || { action: 'missionDaemonTick' }, reason);
}
function combine(existing, next, reason, out) {
  const base = text(next, reason, out);
  return Directive.text(existing ? `${existing} ${base}` : base);
}
function attach(out = {}, reason) {
  if (out.finalAnswerAllowed === true || out.mustContinue === false) return out;
  const next = out.mustCallNext || out.next?.mustCallNext || null;
  if (!next && !out.missionId) return out;
  const why = reason || out.reason || out.error || out.releaseExplanation || 'CONTINUE_REQUIRED';
  const tunnelInstruction = combine(out.tunnelInstruction, next, why, out);
  const missionOperatingRules = out.missionOperatingRules || Commander.operatingRules(out, next || {}, why);
  return { ...out, tunnelInstruction, missionOperatingRules };
}
module.exports = { text, attach, combine };
