// B"H
export function diffGraph(graph, input = {}) {
  const incoming = incomingMap(input);
  const added = [];
  const changed = [];
  const removed = [];
  for (const [id, object] of incoming) compareOne(graph, id, object, added, changed);
  for (const object of graph.list()) if (!incoming.has(object.id)) removed.push(object);
  return { added, changed, removed };
}

function incomingMap(input = {}) {
  const source = input.objects || (input.id ? [input] : []);
  return new Map(source.filter(Boolean).map(object => [object.id, object]));
}

function compareOne(graph, id, object, added, changed) {
  const current = graph.get(id);
  if (!current) added.push(object);
  else if (JSON.stringify(current) !== JSON.stringify(object)) changed.push({ id, before:current, after:object });
}

/** B"H: diff is the mirror that notices which sparks changed shape. */
