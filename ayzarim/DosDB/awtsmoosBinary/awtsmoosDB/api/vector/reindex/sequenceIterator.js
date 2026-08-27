// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/reindex/sequenceIterator.js
 * @chapter One Source Root Opens Once And Every Canonical Pointer Keeps Its Order
 * @description
 * Walks a persisted sequence tree once for vector reindexing. The former indexed
 * loop reparsed the complete sequence root for every row, creating avoidable
 * quadratic source-reading work before each HNSW insertion.
 */

const SmartPointer = require('../../../utils/smartPointer.js');
const Sequence = require('../../../structure/sequence/index.js');

function* iterateSequence(engine) {
	const state = { index: 0 };
	yield* walk(engine, state);
}

function* walk(engine, state) {
	if (!engine.ptr) return;
	const node = engine.nodeIO.load(engine.ptr);
	if (!node) return;
	if (node.isLeaf) {
		for (const item of node.items) {
			yield {
				key: state.index,
				pointer: item.ptr,
				value: undefined
			};
			state.index++;
		}
		return;
	}
	for (const item of node.items) {
		const childPointer = SmartPointer.decode(item.ptr);
		if (!childPointer) continue;
		const child = new Sequence(
			engine.allocator,
			childPointer
		);
		yield* walk(child, state);
	}
}

module.exports = iterateSequence;
