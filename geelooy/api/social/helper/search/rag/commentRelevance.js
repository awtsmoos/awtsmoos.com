// B"H
/** Converts hydrated post hits into independently ranked comment hits. */
function words(value) { return String(value || "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || []; }
function commentText(entry) { return entry?.row?.content || entry?.row?.text || entry?.provenance?.content || ""; }
function overlapScore(query, content) {
  const q = [...new Set(words(query))];
  const body = new Set(words(content));
  if (!q.length) return 0;
  const matched = q.filter(token => body.has(token)).length / q.length;
  const phrase = String(content || "").toLowerCase().includes(String(query || "").toLowerCase()) ? 1 : 0;
  return Math.min(1, matched * 0.8 + phrase * 0.2);
}
function percent(value) { return Number((Math.max(0, Math.min(1, value)) * 100).toFixed(2)); }
function one(hit, entry, query) {
  const row = entry.row || entry.provenance || {};
  const semantic = Number(hit.score || 0);
  const lexical = overlapScore(query, commentText(entry));
  const score = semantic * 0.72 + lexical * 0.28;
  return {
    id: row.id || entry.id,
    score: Number(score.toFixed(6)),
    percent: percent(score),
    semanticPercent: percent(semantic),
    lexicalPercent: percent(lexical),
    row,
    parent: hit.row || {},
    source: entry.source || "comment"
  };
}
function buildCommentHits(hits, query, limit = 50) {
  const seen = new Map();
  for (const hit of hits || []) {
    for (const entry of hit.comments || []) {
      if (!entry?.found && !entry?.provenance) continue;
      const result = one(hit, entry, query);
      if (!result.id) continue;
      const old = seen.get(result.id);
      if (!old || result.score > old.score) seen.set(result.id, result);
    }
  }
  return [...seen.values()].sort((a, b) => b.score - a.score).slice(0, Number(limit) || 50).map((item, index) => ({ ...item, rank:index + 1 }));
}
module.exports = { buildCommentHits, overlapScore };
