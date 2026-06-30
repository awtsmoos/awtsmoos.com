// B"H

/**
 * Tiny top-k keeper.  It holds only the chosen sparks, never a full vocab
 * ocean.  No compiler, no addon, no npm: just JavaScript arranging fire.
 */
function insertTopK(best, id, logit, k) {
  if (!Number.isFinite(logit)) return;
  let i = 0;
  while (i < best.length && best[i].logit >= logit) i++;
  if (i >= k) return;
  best.splice(i, 0, { id, logit });
  if (best.length > k) best.pop();
}

module.exports = { insertTopK };
