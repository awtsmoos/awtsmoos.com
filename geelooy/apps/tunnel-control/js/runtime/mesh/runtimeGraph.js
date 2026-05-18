// B"H

const nodes = new Map();
const edges = [];

/**
 * B"H
 * Registers a graph node representing a runtime, mount, capability, or layer.
 *
 * @param {object} node Mesh node.
 * @returns {object} Node.
 */
export function registerMeshNode(node) {
  if (!node?.id) throw new Error("Mesh node requires id.");
  nodes.set(node.id, { ...node });
  return nodes.get(node.id);
}

/**
 * B"H
 * Links two runtime graph nodes.
 *
 * @param {string} from Source id.
 * @param {string} to Target id.
 * @param {string} type Edge type.
 * @returns {object} Edge.
 */
export function linkMeshNodes(from, to, type = "relates") {
  const edge = { from, to, type, timestamp: Date.now() };
  edges.push(edge);
  return edge;
}

/**
 * B"H
 * Returns the living runtime graph.
 *
 * @returns {{nodes: object[], edges: object[]}} Graph snapshot.
 */
export function readRuntimeGraph() {
  return {
    nodes: [...nodes.values()],
    edges: [...edges]
  };
}

/**
 * B"H
 * Rebuilds graph runtime nodes from runtime registry records.
 *
 * @param {object[]} runtimes Runtime records.
 * @returns {{nodes: object[], edges: object[]}} Graph snapshot.
 */
export function syncRuntimeGraph(runtimes = []) {
  for (const runtime of runtimes) {
    registerMeshNode({
      id: runtime.id,
      type: "runtime",
      label: runtime.label || runtime.tunnel?.name || runtime.id,
      mode: runtime.mode,
      root: runtime.activeRoot,
      capabilities: runtime.mountedCapabilities || {}
    });

    for (const [capability, enabled] of Object.entries(runtime.mountedCapabilities || {})) {
      const capId = `${runtime.id}::capability::${capability}`;
      registerMeshNode({ id: capId, type: "capability", label: capability, enabled });
      linkMeshNodes(runtime.id, capId, enabled ? "provides" : "lacks");
    }
  }

  return readRuntimeGraph();
}
