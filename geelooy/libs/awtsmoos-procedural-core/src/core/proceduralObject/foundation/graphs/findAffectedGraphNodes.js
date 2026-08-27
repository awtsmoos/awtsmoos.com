// B"H

import { createGraphDependentMap } from "./graphDependencies.js";

/** Returns changed nodes and every deterministic downstream dependent. */
export function findAffectedGraphNodes(graph, changedNodeIds) {
	if (!Array.isArray(changedNodeIds)) {
		throw new TypeError("Changed graph node IDs must be an array.");
	}
	const dependents = createGraphDependentMap(graph);
	const affected = new Set();
	const queue = [...new Set(changedNodeIds)].sort();
	for (const nodeId of queue) {
		if (!dependents.has(nodeId)) throw new RangeError(`Unknown changed graph node: ${nodeId}`);
		affected.add(nodeId);
	}
	while (queue.length) {
		const nodeId = queue.shift();
		for (const dependent of [...dependents.get(nodeId)].sort()) {
			if (!affected.has(dependent)) {
				affected.add(dependent);
				queue.push(dependent);
			}
		}
	}
	return Object.freeze([...affected].sort());
}
