/**
 * B"H
 * Map flow graph annotation.
 *
 * Chapter 59: the route graph gains zone wisdom. A jump is no longer just a
 * jump; it has danger, control value, and destination purpose.
 */
export function attachFlowMetadata(map, graph, zones) {
  if (!graph || graph.__flowReady) return graph;
  const byId = new Map((zones?.zones || []).map(z => [z.id, z]));
  graph.zoneByNode = byId;
  graph.edges = graph.edges.map(list => list.map(edge => enrichEdge(edge, byId)));
  graph.__flowReady = true;
  map.__flowGraph = graph;
  return graph;
}

function enrichEdge(edge, byId) {
  const z = byId.get(edge.to);
  const dangerCost = z ? z.danger * 0.18 : 0;
  const controlValue = z ? z.control * 0.2 : 0;
  return { ...edge, zoneKind: z?.kind || 'unknown', dangerCost, controlValue, cost: Math.max(0.5, edge.cost + dangerCost - controlValue) };
}
