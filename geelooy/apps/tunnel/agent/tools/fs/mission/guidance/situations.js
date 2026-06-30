// B"H
/** B"H — Pick the tone from the situation, not from panic. */
function classify(facts) {
  if (facts.blocker) return 'recover';
  if (facts.suggestedMode === 'futureQueue') return 'continueQueue';
  if (facts.suggestedMode === 'claim') return 'executeClaim';
  if (facts.suggestedMode === 'discover') return 'discover';
  if (facts.canSteer) return 'steer';
  return 'continue';
}
function purpose(kind) {
  return ({ recover:'recover', continueQueue:'continue', executeClaim:'execute', discover:'discover', steer:'steer', continue:'encourage' })[kind] || 'encourage';
}
module.exports = { classify, purpose };
