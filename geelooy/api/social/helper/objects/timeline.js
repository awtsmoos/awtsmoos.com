// B"H
/** Chapter 592: Timelines are projections over object timestamps and civilization events. */
const civ = require('../civilization/index.js');
function baseTimeline(object = {}) {
  return [{ type: 'object.created', at: object.createdAt, object: object.key }, { type: 'object.updated', at: object.updatedAt, object: object.key }].filter(x => x.at);
}
function objectTimeline({ $i, object }) {
  const events = civ.listCivilizationEvents({ $i, query: { targetType: object.type, targetId: object.id }, limit: 100 }).success || [];
  return { success: [...events.map(e => ({ type: e.type, at: e.createdAt, event: e.id, object: object.key })), ...baseTimeline(object)].sort((a,b)=>Number(b.at||0)-Number(a.at||0)) };
}
module.exports = { objectTimeline };
