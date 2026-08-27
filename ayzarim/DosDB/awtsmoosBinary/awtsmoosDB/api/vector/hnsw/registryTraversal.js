// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/hnsw/registryTraversal.js
 * @chapter One Root Opens Once And Every Persisted Seal Flows Forward
 * @description
 * Traverses a persisted sequence in order without asking the sequence to reparse
 * its root for every index. This turns registry startup from quadratic work into
 * one linear revelation while preserving every exact HNSW node pointer.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Sequence = require('../../../structure/sequence/index.js');

function readPointers(hnsw, rootPointer) {
	const sequence = new Sequence(
		hnsw.db.allocator,
		rootPointer
	);
	const output = [];
	collectPointers(hnsw, sequence, output);
	return output;
}

function collectPointers(hnsw, sequence, output) {
	if (!sequence.ptr) return;
	const node = sequence.nodeIO.load(sequence.ptr);
	if (!node) return;
	if (node.isLeaf) {
		for (const item of node.items) {
			output.push(readItemPointer(hnsw, item.ptr));
		}
		return;
	}
	for (const item of node.items) {
		const childPointer = SmartPointer.decode(item.ptr);
		if (!childPointer) continue;
		const child = new Sequence(
			sequence.allocator,
			childPointer
		);
		collectPointers(hnsw, child, output);
	}
}

function readItemPointer(hnsw, rawPointer) {
	if (!Buffer.isBuffer(rawPointer)) return null;
	const decoded = SmartPointer.decode(rawPointer);
	if (decoded?.type === constants.TYPE_CUSTOM_INSTANCE) {
		return Buffer.from(rawPointer);
	}
	let value;
	try {
		value = SmartPointer.resolve(
			rawPointer,
			hnsw.db.allocator
		);
	} catch (_error) {
		return null;
	}
	return normalize(value);
}

function normalize(value) {
	if (Buffer.isBuffer(value)) return Buffer.from(value);
	if (Array.isArray(value) && Buffer.isBuffer(value[1])) {
		return Buffer.from(value[1]);
	}
	if (ArrayBuffer.isView(value)) {
		return Buffer.from(
			value.buffer,
			value.byteOffset,
			value.byteLength
		);
	}
	return null;
}

module.exports = {
	readPointers
};
