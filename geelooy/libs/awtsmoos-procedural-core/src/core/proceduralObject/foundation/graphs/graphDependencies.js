// B"H

/** Returns upstream node IDs for one normalized graph node. */
export function listNodeDependencies(node) {
	return Object.freeze([...new Set(Object.values(node.inputs)
		.filter(binding => binding.source?.kind === "node")
		.map(binding => binding.source.nodeId))].sort());
}

/** Builds node -> upstream dependency sets. */
export function createGraphDependencyMap(graph) {
	return new Map(graph.nodes.map(node => [node.id, new Set(listNodeDependencies(node))]));
}

/** Builds node -> downstream dependent sets. */
export function createGraphDependentMap(graph) {
	const dependents = new Map(graph.nodes.map(node => [node.id, new Set()]));
	for (const node of graph.nodes) {
		for (const dependency of listNodeDependencies(node)) {
			if (dependents.has(dependency)) dependents.get(dependency).add(node.id);
		}
	}
	return dependents;
}
