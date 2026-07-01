// B"H
const Facts = require('./facts.js');
const Compose = require('./compose.js');
const Thoughts = require('../../agentThoughts/policy.js');
/** B"H — Render facts into AI-readable plain English and structured metadata. */
function render(action, out, mission) {
  const facts = Facts.from(action, out, mission), message = Compose.compose(facts);
  const thoughtStorage = Thoughts.instruction({}, { missionId:facts.missionId, goal:mission?.goal });
  return { guidanceFacts:facts, guidanceMessage:`${message.text} ${thoughtStorage}`,
    agentGuidance:{ purpose:message.purpose, situation:message.kind, plainEnglish:`${message.text} ${thoughtStorage}`,
      thoughtStorage, canSteer:facts.canSteer, stopAllowed:facts.stopAllowed } };
}
module.exports = { render };
