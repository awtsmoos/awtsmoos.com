// B"H
const Obj = require('./object.js');
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function normGraph(input) { return Array.isArray(input) ? input : input?.objects || [input].filter(Boolean); }
function diff(graph, input = {}) {
  const incoming = new Map(normGraph(input).map(o => [o.id, o]));
  const added = [];
  const removed = [];
  const changed = [];
  for (const [id, object] of incoming) compare(graph, id, object, added, changed);
  for (const object of graph.list()) if (!incoming.has(object.id)) removed.push(Obj.clone(object));
  return { added, removed, changed };
}
function compare(graph, id, object, added, changed) { const current = graph.get(id); if (!current) added.push(object); else if (!same(current, object)) changed.push({ id, before:Obj.clone(current), after:Obj.clone(object) }); }
module.exports = { diff };
/** B"H: server diff counts sparks without swallowing the flame. */
