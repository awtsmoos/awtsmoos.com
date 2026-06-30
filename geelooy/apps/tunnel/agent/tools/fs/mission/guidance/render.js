// B"H
const Facts = require('./facts.js');
const Compose = require('./compose.js');

/** B"H — Render facts into AI-readable plain English and structured metadata. */
function render(action, out, mission) {
  const facts = Facts.from(action, out, mission);
  const message = Compose.compose(facts);
  return {
    guidanceFacts: facts,
    guidanceMessage: message.text,
    agentGuidance: {
      purpose: message.purpose,
      situation: message.kind,
      plainEnglish: message.text,
      canSteer: facts.canSteer,
      stopAllowed: facts.stopAllowed
    }
  };
}
module.exports = { render };
