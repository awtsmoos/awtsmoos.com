// B"H

/**
 * B"H — A mission is a graph of obligations, not a fog of aliases. Every node
 * knows its dependencies, attempt, owner, and state before any worker may claim it.
 */
function createGraph(input = {}) {
	const missionId = required(input.missionId, "missing_mission_id");
	const nodes = Object.fromEntries((input.nodes || []).map(node => {
		const normalized = normalizeNode(missionId, node);
		return [normalized.nodeId, normalized];
	}));
	const graph = { missionId, revision: Number(input.revision || 0), nodes };
	const validation = validateGraph(graph);
	if (!validation.ok) throw failure(validation.error, validation.details);
	return graph;
}

function validateGraph(graph = {}) {
	const ids = Object.keys(graph.nodes || {});
	const missing = [];
	for (const node of Object.values(graph.nodes || {})) {
		for (const dependency of node.dependencies) if (!graph.nodes[dependency]) missing.push([node.nodeId, dependency]);
	}
	if (missing.length) return { ok: false, error: "missing_dependencies", details: missing };
	const cycle = findCycle(graph.nodes || {}, ids);
	return cycle.length ? { ok: false, error: "mission_graph_cycle", details: cycle } : { ok: true };
}

function runnableNodes(graph = {}) {
	return Object.values(graph.nodes || {}).filter(node => {
		if (node.desiredState !== "running" || !["pending", "retrying"].includes(node.observedState)) return false;
		return node.dependencies.every(id => graph.nodes[id]?.observedState === "completed");
	});
}

function transitionNode(graph, nodeId, patch = {}, expectedRevision) {
	const node = graph.nodes?.[nodeId];
	if (!node) throw failure("node_not_found");
	if (expectedRevision !== undefined && node.revision !== expectedRevision) {
		throw failure("node_revision_conflict", { currentRevision: node.revision });
	}
	const updated = {
		...node,
		...patch,
		revision: node.revision + 1,
		updatedAt: new Date().toISOString()
	};
	return {
		...graph,
		revision: graph.revision + 1,
		nodes: { ...graph.nodes, [nodeId]: updated }
	};
}

function normalizeNode(missionId, node = {}) {
	const nodeId = required(node.nodeId, "missing_node_id");
	return {
		nodeId,
		missionId,
		parentNodeId: node.parentNodeId || "",
		type: node.type || "task",
		dependencies: [...new Set(node.dependencies || [])],
		desiredState: node.desiredState || "running",
		observedState: node.observedState || "pending",
		assignedAgentId: node.assignedAgentId || "",
		attempt: Number(node.attempt || 0),
		maxAttempts: Number(node.maxAttempts || 3),
		priority: Number(node.priority || 3),
		claimRevision: Number(node.claimRevision || 0),
		revision: Number(node.revision || 0),
		createdAt: node.createdAt || new Date().toISOString(),
		updatedAt: node.updatedAt || null,
		resultRef: node.resultRef || "",
		failureRef: node.failureRef || "",
		nextNodeIds: [...new Set(node.nextNodeIds || [])]
	};
}

function findCycle(nodes, ids) {
	const visiting = new Set();
	const visited = new Set();
	const path = [];
	function visit(id) {
		if (visiting.has(id)) return [...path, id];
		if (visited.has(id)) return [];
		visiting.add(id);
		path.push(id);
		for (const dependency of nodes[id].dependencies) {
			const cycle = visit(dependency);
			if (cycle.length) return cycle;
		}
		path.pop();
		visiting.delete(id);
		visited.add(id);
		return [];
	}
	for (const id of ids) {
		const cycle = visit(id);
		if (cycle.length) return cycle;
	}
	return [];
}

function required(value, code) {
	if (!String(value || "").trim()) throw failure(code);
	return String(value);
}

function failure(code, details) {
	const error = new Error(code);
	error.code = code;
	error.details = details;
	return error;
}

module.exports = { createGraph, normalizeNode, runnableNodes, transitionNode, validateGraph };
