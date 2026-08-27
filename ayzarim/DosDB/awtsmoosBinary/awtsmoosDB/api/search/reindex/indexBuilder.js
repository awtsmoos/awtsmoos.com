// B"H

/**
 * @file api/search/reindex/indexBuilder.js
 * @chapter Posting Sequences And Their Token Tree Are Sealed Once
 * @description Builds posting lists and replaces the token map bottom-up.
 */

const constants = require('../../../constants.js');
const Sequence = require('../../../structure/sequence/index.js');
const MapEngine = require('../../../structure/map/index.js');
const PhysCache = require('../indexer/physCache.js');

function buildSearchIndex(manager, path, postings) {
	const indexHandle = manager._getIndexer()._getPathIndexHandle(path);
	const entries = [];
	let postingCount = 0;
	for (const [token, tokenPostings] of sortedPostings(postings)) {
		const pointers = Array.from(tokenPostings.values());
		const sequence = new Sequence(manager.db.allocator);
		entries.push({ key: token, value: sequence.bulkLoadPointers(pointers) });
		postingCount += pointers.length;
	}
	const soul = indexHandle[constants.SYMBOLS.INTERNALS] || indexHandle;
	soul.ensureResolved(true);
	const common = soul.writer.common;
	const engine = new MapEngine(manager.db.allocator, common.resolveStructPtr());
	engine.bulkLoadSorted(entries);
	common.checkAutoCompact(engine, constants.VAL_TYPE.MAP);
	common.invalidateEngine();
	PhysCache.clearIndex(indexHandle);
	return {
		tokenCount: entries.length,
		postingCount
	};
}

function sortedPostings(postings) {
	return Array.from(postings.entries()).sort((left, right) => Buffer.compare(
		Buffer.from(left[0], 'utf8'),
		Buffer.from(right[0], 'utf8')
	));
}

module.exports = buildSearchIndex;
