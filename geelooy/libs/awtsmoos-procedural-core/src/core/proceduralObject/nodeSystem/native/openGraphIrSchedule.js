// B"H
// Boruch Hashem
// Blessed is He
/** Stable topological scheduling preserves author order among equal candidates. */

/** Computes a deterministic topological schedule or author-order fallback. */
export function createOpenGraphSchedule(nodes, links) {
	const order = new Map(nodes.map((node, index) => [node.id, index]));
	const incoming = new Map(nodes.map((node) => [node.id, 0]));
	const outgoing = new Map(nodes.map((node) => [node.id, []]));
	for (const link of links) {
		if (!incoming.has(link.to.nodeId) || !outgoing.has(link.from.nodeId)) {
			continue;
		}
		incoming.set(link.to.nodeId, incoming.get(link.to.nodeId) + 1);
		outgoing.get(link.from.nodeId).push(link.to.nodeId);
	}
	const queue = nodes.filter((node) => incoming.get(node.id) === 0);
	const result = [];
	while (queue.length) {
		queue.sort((left, right) => order.get(left.id) - order.get(right.id));
		const node = queue.shift();
		result.push(node.id);
		for (const target of outgoing.get(node.id)) {
			incoming.set(target, incoming.get(target) - 1);
			if (incoming.get(target) === 0) {
				queue.push(nodes.find((candidate) => candidate.id === target));
			}
		}
	}
	return Object.freeze(result.length === nodes.length
		? result
		: nodes.map((node) => node.id));
}
