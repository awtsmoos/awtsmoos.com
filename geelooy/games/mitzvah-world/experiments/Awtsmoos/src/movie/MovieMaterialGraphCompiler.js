// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMaterialGraphCompiler.js
 * @description Resolves bounded material-node documents into runtime material presets.
 * The Awtsmoos renews color, texture, repeat, and atmosphere through connected nodes;
 * Awtsmoos.com evaluates acyclic graphs once during project compilation, never per frame.
 */

export function compileMovieMaterialGraphs(graphs = []) {
	return Object.fromEntries(graphs.map(graph => [graph.id, evaluateGraph(graph)]));
}

function evaluateGraph(graph) {
	const nodes = new Map(graph.nodes.map(node => [node.id, node]));
	const incoming = incomingEdges(graph.edges || []);
	const cache = new Map();
	const output = graph.nodes.find(node => node.type === 'output') || graph.nodes.at(-1);
	if (!output) throw new Error(`Material graph ${graph.id} has no output.`);
	return evaluate(output.id, nodes, incoming, cache, []);
}

function evaluate(nodeId, nodes, incoming, cache, stack) {
	if (cache.has(nodeId)) return cache.get(nodeId);
	if (stack.includes(nodeId)) throw new Error(`Material graph cycle: ${[...stack, nodeId].join(' -> ')}`);
	const node = nodes.get(nodeId);
	if (!node) throw new Error(`Unknown material node: ${nodeId}`);
	const inputs = Object.fromEntries((incoming.get(nodeId) || []).map(edge => [
		edge.input || edge.from,
		evaluate(edge.from, nodes, incoming, cache, [...stack, nodeId])
	]));
	const value = nodeValue(node, inputs);
	cache.set(nodeId, value);
	return value;
}

function nodeValue(node, inputs) {
	if (node.type === 'color') return { color: node.value || '#ffffff' };
	if (node.type === 'texture') return { textureUrl: node.url || null };
	if (node.type === 'normal') return { normalTextureUrl: node.url || null };
	if (node.type === 'number') return Number(node.value || 0);
	if (node.type === 'repeat') {
		return { mapRepeat: [Number(node.x || 1), Number(node.y || 1)] };
	}
	if (node.type === 'mix') {
		return {
			...objectValue(inputs.base),
			...objectValue(inputs.detail),
			mix: Number(node.amount ?? inputs.amount ?? 0.5)
		};
	}
	if (node.type === 'material' || node.type === 'output') {
		return Object.assign({}, ...Object.values(inputs).map(objectValue), node.value || {});
	}
	throw new Error(`Unsupported material node type: ${node.type}`);
}

function objectValue(value) {
	return value && typeof value === 'object' ? value : {};
}

function incomingEdges(edges) {
	const map = new Map();
	for (const edge of edges) {
		if (!map.has(edge.to)) map.set(edge.to, []);
		map.get(edge.to).push(edge);
	}
	return map;
}
