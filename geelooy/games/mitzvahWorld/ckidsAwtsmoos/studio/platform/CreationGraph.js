// B"H
export const CREATION_GRAPH_SCHEMA = "mitzvah-creation-graph-v1";

const clone = value => JSON.parse(JSON.stringify(value ?? null));
const list = value => Array.isArray(value) ? value : value == null ? [] : [value];
const slug = value => String(value || "node").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "node";

export function createCreationGraph(options = {}) {
  return {
    schema:CREATION_GRAPH_SCHEMA,
    id:options.id || "mitzvah_creation_graph",
    title:options.title || "Mitzvah Creation Graph",
    nodes:[],
    edges:[],
    indexes:{ byId:{}, byType:{} }
  };
}

export function addGraphNode(graph, type, data = {}, id = data.id) {
  const nodeId = id || `${slug(type)}_${graph.nodes.length + 1}`;
  const existing = graph.indexes.byId[nodeId];
  if (existing) {
    existing.data = { ...existing.data, ...clone(data) };
    existing.type = type || existing.type;
    return existing;
  }
  const node = { id:nodeId, type:type || "node", data:clone({ ...data, id:nodeId }) || {} };
  graph.nodes.push(node);
  graph.indexes.byId[node.id] = node;
  graph.indexes.byType[node.type] ||= [];
  graph.indexes.byType[node.type].push(node);
  return node;
}

export function addGraphEdge(graph, from, to, relation = "contains", data = {}) {
  const edge = { id:`edge_${graph.edges.length + 1}`, from, to, relation, data:clone(data) || {} };
  graph.edges.push(edge);
  return edge;
}

export function connectChild(graph, parentId, type, data = {}, relation = "contains") {
  const node = addGraphNode(graph, type, data);
  if (parentId) addGraphEdge(graph, parentId, node.id, relation);
  return node;
}

export function graphNodes(graph, type) {
  return type ? [...(graph?.indexes?.byType?.[type] || [])] : [...(graph?.nodes || [])];
}

export function graphChildren(graph, parentId, relation = null) {
  const ids = new Set((graph?.edges || []).filter(edge => edge.from === parentId && (!relation || edge.relation === relation)).map(edge => edge.to));
  return [...ids].map(id => graph.indexes.byId[id]).filter(Boolean);
}

function addCollection(graph, parentId, type, rows, relation = "contains") {
  for (const row of list(rows)) {
    const node = connectChild(graph, parentId, type, row, relation);
    if (row.door?.id) {
      const door = connectChild(graph, node.id, "door", row.door, "has_door");
      if (row.door.opensTo) connectChild(graph, door.id, "interior", { id:row.door.opensTo }, "opens_to");
    }
  }
}

export function buildGraphFromAiWorld(parsed = {}, options = {}) {
  const graph = createCreationGraph({ id:options.id || `${parsed.world?.id || "world"}_graph`, title:parsed.world?.title || parsed.world?.id || "AI World Graph" });
  const world = addGraphNode(graph, "world", parsed.world || { id:"world" }, parsed.world?.id || "world");
  if (parsed.terrain) connectChild(graph, world.id, "terrain", parsed.terrain, "has_terrain");
  addCollection(graph, world.id, "house", parsed.houses);
  addCollection(graph, world.id, "door", parsed.doors, "has_door");
  addCollection(graph, world.id, "animal", parsed.animals, "has_animal");
  addCollection(graph, world.id, "npc", parsed.npcs, "has_npc");
  addCollection(graph, world.id, "shop", parsed.shops, "has_shop");
  addCollection(graph, world.id, "trainer", parsed.trainers, "has_trainer");
  for (const quest of list(parsed.quests)) {
    const questNode = connectChild(graph, world.id, "quest", quest, "has_quest");
    if (quest.giverId) addGraphEdge(graph, quest.giverId, questNode.id, "offers_quest");
    if (quest.next) addGraphEdge(graph, questNode.id, quest.next, "unlocks_quest");
  }
  if (parsed.movie) {
    const movie = connectChild(graph, world.id, "movie", parsed.movie, "has_movie");
    for (const shot of list(parsed.movie.shots)) connectChild(graph, movie.id, "shot", shot, "has_shot");
  }
  return graph;
}

export function summarizeGraph(graph = {}) {
  const counts = {};
  for (const node of graph.nodes || []) counts[node.type] = (counts[node.type] || 0) + 1;
  return { id:graph.id, nodes:graph.nodes?.length || 0, edges:graph.edges?.length || 0, counts };
}

export default { CREATION_GRAPH_SCHEMA, createCreationGraph, addGraphNode, addGraphEdge, connectChild, graphNodes, graphChildren, buildGraphFromAiWorld, summarizeGraph };
