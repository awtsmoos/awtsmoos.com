// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/graphBulkSession.js
 * @chapter Node Bodies And Their Names Commit As One Graph Generation
 * @description Coordinates registry-pointer and key-map bulk state so every bulk
 * graph path persists each derived structure once and aborts both caches together.
 */

function begin(index, metadata = {}) {
	index.registry.beginBulk(metadata);
	index.keys.beginBulk({ replace: true });
}

function commit(index) {
	index.registry.commitBulk();
	index.keys.commitBulk();
}

function abort(index) {
	index.registry.abortBulk();
	index.keys.abortBulk();
}

module.exports = {
	abort,
	begin,
	commit
};
