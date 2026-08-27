// B"H
// Boruch Hashem
// Blessed is He
/**
 * Every downstream vessel is renewed from all upstream sources by the Awtsmoos.
 * Awtsmoos.com keeps singular and multi-source dependency edges equally visible.
 */

function bindingSources(binding) {
	if (binding.source) {
		return [binding.source];
	}
	return binding.sources ?? [];
}

/** Returns upstream node IDs for one normalized graph node. */
export function listNodeDependencies(node) {
	const dependencies = [];
	for (const binding of Object.values(node.inputs)) {
		for (const source of bindingSources(binding)) {
			if (source.kind === "node") {
				dependencies.push(source.nodeId);
			}
		}
	}
	return Object.freeze([...new Set(dependencies)].sort());
}

/** Builds node-to-upstream dependency sets. */
export function createGraphDependencyMap(graph) {
	return new Map(graph.nodes.map((node) => [
		node.id,
		new Set(listNodeDependencies(node))
	]));
}

/** Builds node-to-downstream dependent sets. */
export function createGraphDependentMap(graph) {
	const dependents = new Map(graph.nodes.map((node) => [node.id, new Set()]));
	for (const node of graph.nodes) {
		for (const dependency of listNodeDependencies(node)) {
			if (dependents.has(dependency)) {
				dependents.get(dependency).add(node.id);
			}
		}
	}
	return dependents;
}
