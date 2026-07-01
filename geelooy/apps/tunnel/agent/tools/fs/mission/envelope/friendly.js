// B"H
const Thoughts = require('../../agentThoughts/policy.js');
function thoughtText(result = {}) { return Thoughts.instruction({}, { missionId:result.missionId, conversationName:result.conversationName, goal:result.goal }); }
function message(next, result = {}) {
  const action = next?.action || 'missionRoomSchedulerStatus';
  const base = result.agentGuidance?.plainEnglish || `Good checkpoint. The mission is still active, so continue with ${action}, or steer to safer higher-value work and explain why.`;
  return `${base} ${thoughtText(result)}`;
}
function agentGuidance(next, result = {}) {
  return { ...(result.agentGuidance || {}), purpose:'continue', plainEnglish:message(next, result),
    thoughtStorage:thoughtText(result), canSteer:true,
    emergencyStopPolicy:'Use emergency stop only for safety, tool loss, fatal corruption, lease expiry, verified user stop, or explicit testing emergency with a reason.' };
}
/** B"H — The tunnel speaks like a teammate while the hard fields do the guard work. */
module.exports = { message, agentGuidance, thoughtText };
