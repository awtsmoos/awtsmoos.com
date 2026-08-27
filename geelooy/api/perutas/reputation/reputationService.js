// B"H
const { pushLedger } = require("../ledgerService.js");

/** B"H: Reputation is the non-monetary shadow of marketplace trust. */
function addEvent(store, subjectType, subjectId, kind, weight = 1, meta = {}) {
  store.perutaReputation = store.perutaReputation || [];
  const event = { subjectType, subjectId, kind, weight: Number(weight || 0), meta, at: new Date().toISOString() };
  store.perutaReputation.push(event);
  pushLedger(store, { userId: meta.userId || subjectId, kind: "reputation_event", meta: event });
  return event;
}
function score(store, subjectType, subjectId) {
  const events = (store.perutaReputation || []).filter(x => x.subjectType === subjectType && x.subjectId === subjectId);
  const total = events.reduce((a, x) => a + Number(x.weight || 0), 0);
  return { ok: true, subjectType, subjectId, score: total, events: events.slice(-50).reverse(), trustLevel: level(total) };
}
function leaderboard(store, subjectType = "agent") {
  const map = new Map();
  for (const event of store.perutaReputation || []) if (event.subjectType === subjectType) map.set(event.subjectId, (map.get(event.subjectId) || 0) + Number(event.weight || 0));
  return { ok: true, subjectType, rows: [...map.entries()].map(([subjectId, score]) => ({ subjectId, score, trustLevel: level(score) })).sort((a, b) => b.score - a.score) };
}
function level(score) { if (score >= 100) return "crown"; if (score >= 25) return "trusted"; if (score >= 5) return "rising"; if (score < 0) return "risk"; return "new"; }
module.exports = { addEvent, leaderboard, score };
