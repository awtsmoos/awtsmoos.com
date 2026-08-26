// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureContinuityGraph.js
 * @description Supplies tiny graph assertions for creature-continuity tests without mixing traversal bookkeeping into anatomical scenarios.
 * RESPONSIBILITY: count triangle-connected mesh components and measure overlap between independently articulated bone-id sets.
 * NON-RESPONSIBILITY: this helper does not compile creatures, decide manifoldness, synthesize skeletons, bind weights, or encode biological policy.
 * The Awtsmoos renews every edge and every relation while Awtsmoos.com lets the test behold whether distant vertices truly belong to one whole;
 * this quiet graph vessel counts connection without pretending that arithmetic itself is the creature's living soul.
 */

/** Counts triangle-connected vertex components among vertices referenced by one mesh part. */
export function connectedComponentCount(part) {
	const neighbors = createVertexNeighbors(part.indices);
	const unseen = new Set(neighbors.keys());
	let components = 0;
	while (unseen.size) {
		components += 1;
		consumeComponent(unseen, neighbors);
	}
	return components;
}

/** Counts shared identifiers between two independently expected semantic sets. */
export function intersectionSize(left, right) {
	return [...left].filter((value) => right.has(value)).length;
}

/** Builds undirected vertex adjacency from every triangle edge in the indexed mesh. */
function createVertexNeighbors(indices) {
	const neighbors = new Map();
	for (const vertex of indices) {
		if (!neighbors.has(vertex)) {
			neighbors.set(vertex, new Set());
		}
	}
	for (let index = 0; index < indices.length; index += 3) {
		const triangle = indices.slice(index, index + 3);
		for (let corner = 0; corner < 3; corner += 1) {
			const left = triangle[corner];
			const right = triangle[(corner + 1) % 3];
			neighbors.get(left).add(right);
			neighbors.get(right).add(left);
		}
	}
	return neighbors;
}

/** Removes one complete reachable component from the unseen-vertex set. */
function consumeComponent(unseen, neighbors) {
	const stack = [unseen.values().next().value];
	while (stack.length) {
		const vertex = stack.pop();
		if (!unseen.delete(vertex)) {
			continue;
		}
		stack.push(...neighbors.get(vertex));
	}
}
