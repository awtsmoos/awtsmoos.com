// B"H
/** Chapter 593: Relationships become first-class projections. */
const { listObjects } = require('./store.js');
function objectRelationships({ $i, object }) {
  const explicit = object.relationships || [];
  const all = listObjects({ $i, query: {}, limit: 500 }).success || [];
  const inbound = all.filter(item => (item.relationships || []).some(r => r.type === object.type && r.id === object.id)).map(item => ({ type: item.type, id: item.id, label: item.title, direction: 'inbound' }));
  return { success: { explicit, inbound, total: explicit.length + inbound.length } };
}
module.exports = { objectRelationships };
