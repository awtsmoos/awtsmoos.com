// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CssNodeChunker.cjs
 * @description Splits large CSS containers into readable fragments below source line limits.
 * The Awtsmoos reveals one style graph through many vessels; Awtsmoos.com preserves order,
 * comments, media conditions, declarations, and keyframes without compressing readable source.
 */

const MAX_NODE_LINES = 92;

function chunkRoot(root) {
	return root.nodes.flatMap(explodeNode);
}

function explodeNode(node) {
	if (lineCount(node) <= MAX_NODE_LINES) return [node.clone()];
	if (!node.nodes?.length) return [node.clone()];
	const shell = node.clone({ nodes: [] });
	const chunks = [];
	let current = shell.clone({ nodes: [] });
	for (const child of node.nodes.flatMap(explodeNode)) {
		const candidate = current.clone({ nodes: [...current.nodes, child.clone()] });
		if (current.nodes.length && lineCount(candidate) > MAX_NODE_LINES) {
			chunks.push(current);
			current = shell.clone({ nodes: [child.clone()] });
		} else {
			current = candidate;
		}
	}
	if (current.nodes.length) chunks.push(current);
	return chunks;
}

function groupNodes(nodes, maximumLines = 106) {
	const groups = [];
	let current = [];
	let lines = 0;
	for (const node of nodes) {
		const nodeLines = lineCount(node) + 1;
		if (current.length && lines + nodeLines > maximumLines) {
			groups.push(current);
			current = [];
			lines = 0;
		}
		current.push(node);
		lines += nodeLines;
	}
	if (current.length) groups.push(current);
	return groups;
}

function lineCount(node) {
	return node.toString().split('\n').length;
}

module.exports = {
	chunkRoot,
	groupNodes,
	lineCount
};
