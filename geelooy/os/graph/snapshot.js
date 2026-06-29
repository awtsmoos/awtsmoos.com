// B"H
export function graphIndexes(objects = []) {
  const byType = {}, byParent = {}, byPath = {}, reverseRefs = {};
  for (const object of objects) {
    (byType[object.type] ||= []).push(object.id);
    if (object.parentId) (byParent[object.parentId] ||= []).push(object.id);
    if (object.path) byPath[object.path] = object.id;
    for (const ref of [...(object.refs || []), ...(object.children || [])]) (reverseRefs[ref] ||= []).push(object.id);
  }
  return { byType, byParent, byPath, reverseRefs };
}

export function snapshot(graph) {
  const objects = graph.list();
  return {
    kind:"awtsmoos-object-graph",
    version:3,
    at:new Date().toISOString(),
    objects,
    indexes:graphIndexes(objects),
    watchers:graph.watchers?.() || [],
    events:graph.history?.({ limit:100 }) || graph.events.list()
  };
}

/**
 * B"H
 * A snapshot freezes no life; it catches one glimmer of the river. Now the
 * listening vessels are visible too, so live sync can see who waits for change.
 */
