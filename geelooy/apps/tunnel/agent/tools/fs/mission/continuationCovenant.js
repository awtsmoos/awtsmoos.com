// B"H
const Exceptions = require('./covenant/exceptions.js');
const Language = require('./covenant/language.js');
const Issues = require('./covenant/issues.js');
const Response = require('./covenant/response.js');
/** B"H — Tiny covenant doorway: policy in small vessels, mission still alive. */
module.exports = {
  RELEASE_EXCEPTIONS: Exceptions.DIRECT,
  PLAIN_ENGLISH: Language.GUIDANCE,
  QUESTIONS: Language.QUESTIONS,
  allCapsPrompt: extra => [...Language.GUIDANCE, ...Language.QUESTIONS, ...[].concat(extra || [])].join(' '),
  checkpointMessage: Language.checkpointMessage,
  ...Exceptions,
  ...Issues,
  ...Response
};
