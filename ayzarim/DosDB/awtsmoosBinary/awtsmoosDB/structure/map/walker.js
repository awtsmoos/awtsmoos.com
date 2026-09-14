//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module AwtsmoosBTreeRangeWalker
 * @description
 * Walks only B-tree branches whose key intervals can intersect a requested range.
 * Internal separator keys are the first keys of their right-hand children, so a
 * narrow prefix/range query seeks through disk structure instead of visiting the
 * entire map and filtering after unrelated pages have already been loaded.
 */

const SmartPointer = require('../../utils/smartPointer/index.js');

/** Converts an optional public bound into one stable binary comparison key. */
function boundBuffer(value) {
	if (value === undefined || value === null || value === '') return null;
	return Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
}

/** Returns whether one ordered child interval can contain any requested key. */
function childIntersects(node, index, startBuffer, endBuffer) {
	const lower = index === 0 ? null : node.keys[index - 1];
	const upper = index < node.keys.length ? node.keys[index] : null;
	if (startBuffer && upper && upper.compare(startBuffer) <= 0) return false;
	if (endBuffer && lower && lower.compare(endBuffer) > 0) return false;
	return true;
}
/** Yields matching values from one leaf without materializing unrelated keys. */
function* walkLeaf(node, startBuffer, endBuffer) {
	for (let index = 0; index < node.keys.length; index += 1) {
		const key = node.keys[index];
		if (startBuffer && key.compare(startBuffer) < 0) continue;
		if (endBuffer && key.compare(endBuffer) > 0) break;
		yield { key, ptr: node.values[index] };
	}
}

/** Descends only branches whose separator interval intersects the requested range. */
function* walkNode(nodeIO, node, startBuffer, endBuffer) {
	if (!node) return;
	if (node.isLeaf) {
		yield* walkLeaf(node, startBuffer, endBuffer);
		return;
	}
	for (let index = 0; index < node.children.length; index += 1) {
		if (!childIntersects(node, index, startBuffer, endBuffer)) {
			const lower = index === 0 ? null : node.keys[index - 1];
			if (endBuffer && lower && lower.compare(endBuffer) > 0) break;
			continue;
		}
		const pointer = SmartPointer.decode(node.children[index]);
		const child = nodeIO.load(pointer);
		yield* walkNode(nodeIO, child, startBuffer, endBuffer);
	}
}
/**
 * Streams entries in key order between optional inclusive bounds.
 * @param {object} nodeIO Map-node loader backed by the database pager.
 * @param {object} node Root B-tree node already loaded by MapEngine.
 * @param {string|Buffer|null} start Inclusive lower bound.
 * @param {string|Buffer|null} end Inclusive upper bound.
 * @yields {{key:Buffer,ptr:Buffer}} Matching persisted key/value pointers.
 */
function* walk(nodeIO, node, start, end) {
	const startBuffer = boundBuffer(start);
	const endBuffer = boundBuffer(end);
	yield* walkNode(nodeIO, node, startBuffer, endBuffer);
}

module.exports = walk;
module.exports.childIntersects = childIntersects;
