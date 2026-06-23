// B"H
/**
 * @file WorldFactDatabase.js
 * A tiny in-memory fact database. The Awtsmoos creates every event from ayin;
 * this vessel stores compact facts so the world can remember without lag.
 */
function stableId(fact = {}) {
  return fact.id || `${fact.kind || 'fact'}:${fact.target || 'world'}:${fact.key || fact.text || Date.now()}`;
}
function match(fact, filter = {}) {
  return Object.entries(filter).every(([key, value]) => value == null || fact[key] === value);
}
export function createWorldFactDatabase(limit = 1000) {
  const facts = new Map();
  function upsert(input = {}) {
    const id = stableId(input);
    const previous = facts.get(id) || {};
    const fact = { ...previous, ...input, id, at:input.at || previous.at || Date.now(), updatedAt:Date.now() };
    facts.set(id, fact);
    while (facts.size > limit) facts.delete(facts.keys().next().value);
    return fact;
  }
  function remove(id) { return facts.delete(id); }
  function get(id) { return facts.get(id) || null; }
  function query(filter = {}) { return [...facts.values()].filter(f => match(f, filter)); }
  function count(filter = {}) { return query(filter).length; }
  function report() {
    const byKind = {};
    for (const fact of facts.values()) byKind[fact.kind || 'fact'] = (byKind[fact.kind || 'fact'] || 0) + 1;
    return { facts:facts.size, byKind };
  }
  return { upsert, remove, get, query, count, report, facts };
}
export default createWorldFactDatabase;
