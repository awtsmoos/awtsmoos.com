// B"H
/** Builds a minimum connected graph from the plaza to every house entry. */
export function createRoadGraph(houseAnchors) {
	const plaza = { id: 'plaza', x: 31, z: -22, kind: 'plaza' };
	const entries = houseAnchors.map((anchors) => ({
		id: `${anchors.id}-entry`,
		x: anchors.frontStairs.x,
		z: anchors.frontStairs.z,
		kind: 'house-entry',
		houseId: anchors.id,
		gate: anchors.roadGate,
		landing: anchors.frontStairs
	}));
	const nodes = [plaza, ...entries];
	const connected = [plaza];
	const remaining = [...entries];
	const edges = [];
	while (remaining.length) {
		const choice = nearestConnection(connected, remaining);
		edges.push({
			id: `road-${choice.from.id}-to-${choice.to.id}`,
			from: choice.from.id,
			to: choice.to.id,
			width: 6.2
		});
		connected.push(choice.to);
		remaining.splice(remaining.indexOf(choice.to), 1);
	}
	const graph = { nodes, edges };
	return { ...graph, validation: validateRoadGraph(graph) };
}

export function validateRoadGraph(graph) {
	const adjacency = new Map(graph.nodes.map((node) => [node.id, []]));
	for (const edge of graph.edges) {
		adjacency.get(edge.from)?.push(edge.to);
		adjacency.get(edge.to)?.push(edge.from);
	}
	const visited = new Set();
	const queue = graph.nodes.length ? [graph.nodes[0].id] : [];
	while (queue.length) {
		const id = queue.shift();
		if (visited.has(id)) {
			continue;
		}
		visited.add(id);
		queue.push(...(adjacency.get(id) || []));
	}
	return {
		connected: visited.size === graph.nodes.length,
		nodeCount: graph.nodes.length,
		edgeCount: graph.edges.length,
		houseEntries: graph.nodes.filter((node) => node.kind === 'house-entry').length,
		unreachableNodes: graph.nodes.filter((node) => !visited.has(node.id)).map((node) => node.id)
	};
}

function nearestConnection(connected, remaining) {
	let best = null;
	for (const from of connected) {
		for (const to of remaining) {
			const distance = Math.hypot(to.x - from.x, to.z - from.z);
			if (!best || distance < best.distance) {
				best = { from, to, distance };
			}
		}
	}
	return best;
}
