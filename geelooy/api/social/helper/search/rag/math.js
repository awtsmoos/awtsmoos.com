// B"H
/** @module SocialRagMath @description A small cosine flame for vector nearness. */
function vector(row) { return row?.vec || row?.embedding || row?.vector || null; }
function cosine(a, b) {
  let dot = 0, aa = 0, bb = 0;
  const n = Math.min(a?.length || 0, b?.length || 0);
  for (let i = 0; i < n; i++) { const x = Number(a[i]) || 0, y = Number(b[i]) || 0; dot += x*y; aa += x*x; bb += y*y; }
  return dot / ((Math.sqrt(aa) || 1) * (Math.sqrt(bb) || 1));
}
function closeness(score) { return Number(Math.max(0, Math.min(100, score * 100)).toFixed(2)); }
function sortHits(rows, qv, limit) {
  return rows.filter(r => vector(r)).map(r => ({ ...r, score: cosine(qv, vector(r)) }))
    .sort((a, b) => b.score - a.score).slice(0, Number(limit) || 10)
    .map((r, i) => ({ rank: i + 1, score: Number(r.score.toFixed(6)), percent: closeness(r.score), row: r }));
}
module.exports = { vector, cosine, closeness, sortHits };
