// B"H
function applyRepetitionPenalty(logits, tokens, penalty = 1.08) {
  const seen = new Set(tokens.slice(-128));
  for (const id of seen) {
    if (id >= 0 && id < logits.length) logits[id] = logits[id] < 0 ? logits[id] * penalty : logits[id] / penalty;
  }
  return logits;
}
module.exports = { applyRepetitionPenalty };
