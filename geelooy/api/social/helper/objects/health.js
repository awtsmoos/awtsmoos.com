// B"H
/** Chapter 594: Object health names activity, staleness, and heat. */
function objectHealth({ object, timeline = [] }) {
  const age = Date.now() - Number(object.updatedAt || object.createdAt || 0);
  const events = timeline.length;
  const level = age > 1000 * 60 * 60 * 24 * 90 ? 'stale' : events > 25 ? 'hot' : events > 5 ? 'active' : 'emerging';
  return { level, events, ageMs: age, density: events > 40 ? 'legendary' : events > 15 ? 'deep' : events > 4 ? 'medium' : 'shallow' };
}
module.exports = { objectHealth };
