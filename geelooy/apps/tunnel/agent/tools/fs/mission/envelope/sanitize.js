// B"H
const PASSIVE = /(let me know|what next\??|tell me what to do next|waiting for your next)/i;
function replaceText(text, next) {
  if (typeof text !== 'string' || !PASSIVE.test(text)) return text;
  const action = next?.action || 'missionRoomSchedulerStatus';
  return text.replace(PASSIVE, `continue with ${action}, or steer to higher-value safe work with a receipt`);
}
/**
 * B"H — Passive endings dissolve into continuation.
 * The agent is not scolded; it is handed the next useful handle.
 */
function apply(result = {}, next) {
  const out = { ...result };
  for (const key of ['message','summary','tunnelInstruction']) out[key] = replaceText(out[key], next);
  if (out.agentGuidance?.plainEnglish) out.agentGuidance = { ...out.agentGuidance, plainEnglish:replaceText(out.agentGuidance.plainEnglish, next) };
  return out;
}
module.exports = { apply, replaceText, PASSIVE };
