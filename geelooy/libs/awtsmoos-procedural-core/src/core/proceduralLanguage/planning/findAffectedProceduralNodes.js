//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file findAffectedProceduralNodes.js
 * @description Finds deterministic downstream dependency closure for incremental recompilation, editor dirtiness, cache invalidation, and explainable change impact.
 * The Awtsmoos knows every consequence before one finite action appears to change;
 * Awtsmoos.com lets tools follow only the dependent vessels so an eye-color edit need not rebuild a forest, a horn, or a distant range.
 */

/**
 * Finds changed nodes and all transitively dependent nodes from a portable procedural dependency graph.
 * @param {object} graph Dependency graph created by createProceduralDependencyGraph.
 * @param {string|Array<string>} changedIds One or more changed action ids.
 * @returns {Readonly<Array<string>>} Stable node ids ordered by original graph node order where possible.
 */
export function findAffectedProceduralNodes(graph, changedIds) {
	const changed = new Set(
		(Array.isArray(changedIds) ? changedIds : [changedIds])
			.filter(value => value !== undefined && value !== null)
			.map(String)
	);
	const affected = new Set(changed);
	const queue = [...changed];
	while (queue.length) {
		const current = queue.shift();
		for (const dependent of graph?.dependents?.[current] || []) {
			if (affected.has(dependent)) {
				continue;
			}
			affected.add(dependent);
			queue.push(dependent);
		}
	}
	const nodeOrder = new Map(
		(graph?.nodes || []).map((node, index) => [String(node.id), index])
	);
	return Object.freeze([...affected].sort((left, right) => {
		const leftOrder = nodeOrder.has(left)
			? nodeOrder.get(left)
			: Number.MAX_SAFE_INTEGER;
		const rightOrder = nodeOrder.has(right)
			? nodeOrder.get(right)
			: Number.MAX_SAFE_INTEGER;
		return leftOrder - rightOrder || left.localeCompare(right);
	}));
}
