// B"H

import { createGraphDependencyMap } from "./graphDependencies.js";

/**
 * Produces a lexical topological schedule whose order does not depend on object
 * insertion, Map history, locale, or whichever host currently reveals the graph.
 */
export function scheduleTypedGraph(graph) {
	const dependencies = createGraphDependencyMap(graph);
	const dependents = new Map(graph.nodes.map(node => [node.id, new Set()]));
	for (const [nodeId, upstream] of dependencies) {
		for (const dependency of upstream) {
			if (!dependencies.has(dependency)) {
				throw new Error(`Graph node ${nodeId} references missing node ${dependency}.`);
			}
			dependents.get(dependency).add(nodeId);
		}
	}
	const indegree = new Map([...dependencies].map(([id, upstream]) => [id, upstream.size]));
	const ready = [...indegree]
		.filter(([, degree]) => degree === 0)
		.map(([id]) => id)
		.sort();
	const schedule = [];
	while (ready.length) {
		const nodeId = ready.shift();
		schedule.push(nodeId);
		for (const dependent of [...dependents.get(nodeId)].sort()) {
			const degree = indegree.get(dependent) - 1;
			indegree.set(dependent, degree);
			if (degree === 0) {
				ready.push(dependent);
				ready.sort();
			}
		}
	}
	if (schedule.length !== graph.nodes.length) {
		const cyclicNodes = [...indegree]
			.filter(([, degree]) => degree > 0)
			.map(([id]) => id)
			.sort();
		const error = new Error(`Typed graph contains a cycle: ${cyclicNodes.join(", ")}`);
		Object.defineProperty(error, "cyclicNodes", { value: Object.freeze(cyclicNodes) });
		throw error;
	}
	return Object.freeze(schedule);
}
