// B"H
export function byType(graph, type) {
  return graph.list().filter(object => object.type === type);
}

export function search(graph, text = "") {
  const q = String(text).toLowerCase();
  return graph.list().filter(object => JSON.stringify(object).toLowerCase().includes(q));
}

export function pathLookup(graph, value = "") {
  const text = String(value);
  return graph.list().find(object => [
    object.id, object.url, object.path, object.title
  ].includes(text)) || search(graph, text)[0] || null;
}

/**
 * B"H
 * Query is the lantern-bearer. It does not own the graph, it walks through it,
 * whispering names until one object turns its face toward the traveler.
 */
