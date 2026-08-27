// B"H
/**
 * @module CivilizationState
 * @description Chapter 549: not merely counts, but a pulse: velocity,
 * relationships, participation, unanswered sparks, and living heat.
 */

function countBy(items, fn) {
  const out = {};
  for (const item of items) { const key = fn(item) || 'unknown'; out[key] = (out[key] || 0) + 1; }
  return out;
}
function recent(events, ms) {
  const now = Date.now();
  return events.filter(event => now - Number(event.createdAt || 0) <= ms);
}
function relationshipDensity(events) {
  const actors = new Set(events.map(e => e.actor?.id).filter(Boolean));
  const targets = new Set(events.map(e => e.target?.id).filter(Boolean));
  const possible = Math.max(1, actors.size * Math.max(1, targets.size));
  return Math.round((events.length / possible) * 1000) / 1000;
}
function civilizationState({ events = [], subscriptions = [] }) {
  const day = recent(events, 86400000);
  const hour = recent(events, 3600000);
  const actors = new Set(events.map(e => e.actor?.id).filter(Boolean));
  const targets = new Set(events.map(e => `${e.target?.type}:${e.target?.id}`).filter(x => !x.endsWith(':')));
  return {
    generatedAt: Date.now(), totals: { events: events.length, actors: actors.size, targets: targets.size, subscriptions: subscriptions.length },
    velocity: { lastHour: hour.length, lastDay: day.length },
    byType: countBy(events, e => e.type), byTargetType: countBy(events, e => e.target?.type),
    relationshipDensity: relationshipDensity(events), activeActors: [...actors].slice(0, 50), hotTargets: Object.entries(countBy(events, e => `${e.target?.type}:${e.target?.id}`)).sort((a,b)=>b[1]-a[1]).slice(0, 20),
    health: { level: events.length > 100 ? 'roaring' : events.length > 20 ? 'awake' : events.length > 0 ? 'sparked' : 'quiet', unanswered: events.filter(e => e.type.includes('question') && !events.some(x => x.parents?.some(p => p.id === e.id))).length }
  };
}
module.exports = { civilizationState };
