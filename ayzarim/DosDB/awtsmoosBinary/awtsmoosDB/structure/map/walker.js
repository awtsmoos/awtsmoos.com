// B"H

/**
 * @file structure/map/walker.js
 * @chapter Ordered Branches Reveal Every Leaf In Sequence
 * @description Traverses map nodes for bounded range iteration.
 */

const SmartPointer = require('../../utils/smartPointer/index.js');

function* walk(nodeIO, node, start, end) {
	if (!node) return;
	const startBuffer = start ? Buffer.from(String(start), 'utf8') : null;
	const endBuffer = end ? Buffer.from(String(end), 'utf8') : null;
	if (node.isLeaf) {
		yield* walkLeaf(node, startBuffer, endBuffer);
		return;
	}
	for (const childPointer of node.children) {
		const child = nodeIO.load(SmartPointer.decode(childPointer));
		yield* walk(nodeIO, child, start, end);
	}
}

function* walkLeaf(node, startBuffer, endBuffer) {
	for (let index = 0; index < node.keys.length; index++) {
		const key = node.keys[index];
		if (startBuffer && key.compare(startBuffer) < 0) continue;
		if (endBuffer && key.compare(endBuffer) > 0) break;
		yield { key, ptr: node.values[index] };
	}
}

module.exports = walk;
