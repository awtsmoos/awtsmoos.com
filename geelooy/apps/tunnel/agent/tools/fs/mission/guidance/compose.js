// B"H
const P = require('./phrases.js');
const S = require('./situations.js');

/**
 * B"H — Compose guidance like a teammate.
 * The message is generated from facts, so the tunnel can soothe, steer, and
 * continue without hardcoded all-caps commands scattered through actions.
 */
function compose(facts) {
  const kind = S.classify(facts);
  const lines = [P.opening[kind], P.middle[kind]];
  if (facts.queueDepth > 0) lines.push(`There are ${facts.queueDepth} queued items visible.`);
  if (facts.nextAction) lines.push(`A reasonable next action is ${facts.nextAction}.`);
  if (facts.canSteer) lines.push('If you see a higher-value path, steer deliberately and say why.');
  lines.push(P.ending);
  return { kind, purpose:S.purpose(kind), text:lines.filter(Boolean).join(' ') };
}
module.exports = { compose };
