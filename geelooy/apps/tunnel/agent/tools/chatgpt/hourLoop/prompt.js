// B"H
const C = require('./constants.js');
const H = require('./handoff.js');

/** B"H — Chapter 1944: The next prompt is a blade, not a library. */
function build(packet = {}) {
  const handoff = H.enforce(packet);
  const lines = [
    'B"H Continue from compact handoff.',
    `Mission: ${handoff.missionId || 'none'}`,
    `Conversation: ${handoff.conversationId || 'unknown'}`,
    `Current objective: ${handoff.objective || 'continue verified work'}`,
    evidence(handoff),
    files(handoff),
    `Next exact action: ${JSON.stringify(handoff.nextAction || {})}`,
    `Emergency exits: ${(handoff.emergencyExit || []).join(', ') || 'user_stop, unsafe_action, repeated_failure'}`,
    'Rules: do not final-answer while lease active; do not ask user unless emergencyExit.',
    'After action: record evidence and return next compact handoff.'
  ].filter(Boolean);
  return H.short(lines.join('\n'), C.PROMPT_MAX_CHARS);
}

function evidence(h) {
  return h.evidence?.length ? `Last evidence:\n- ${h.evidence.join('\n- ')}` : '';
}
function files(h) {
  return h.touchedFiles?.length ? `Touched files:\n- ${h.touchedFiles.join('\n- ')}` : '';
}
module.exports = { build, evidence, files };
