// B"H
function traverse(graph, { id, direction = 'out', depth = 2, types = [] } = {}) {
  const wanted = new Set(Array.isArray(types) ? types : [types].filter(Boolean));
  const seen = new Set();
  const objects = [];
  const edges = [];
  let frontier = [id].filter(Boolean);
  for (let level = 0; level <= Number(depth || 0) && frontier.length; level++) {
    const next = [];
    for (const current of frontier) visit(graph, current, direction, wanted, seen, objects, edges, next);
    frontier = next;
  }
  return { objects, edges };
}

function visit(graph, current, direction, wanted, seen, objects, edges, next) {
  if (seen.has(current)) return;
  seen.add(current);
  const object = graph.get(current);
  if (object && (!wanted.size || wanted.has(object.type))) objects.push(object);
  const refs = graph.references(current);
  const linked = direction === 'in' ? refs.reverse : [...refs.refs, ...refs.children];
  for (const target of linked) {
    edges.push({ from:direction === 'in' ? target.id : current, to:direction === 'in' ? current : target.id });
    next.push(target.id);
  }
}

module.exports = { traverse };
/** B"H: traversal reveals relation without owning relation. */
