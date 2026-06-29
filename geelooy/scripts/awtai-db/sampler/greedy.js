// B"H

function greedy(logits) {
  let bi = 0, bv = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    const v = logits[i];
    if (v > bv) { bv = v; bi = i; }
  }
  return bi;
}

function topK(logits, k) {
  const best = [];
  for (let id = 0; id < logits.length; id++) insert(best, { id, logit: logits[id] }, k);
  return best;
}

function insert(best, item, k) {
  if (!Number.isFinite(item.logit)) return;
  let i = 0;
  while (i < best.length && best[i].logit >= item.logit) i++;
  if (i >= k) return;
  best.splice(i, 0, item);
  if (best.length > k) best.pop();
}

module.exports = { greedy, topK };
