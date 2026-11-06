// B"H

/**
 * @file api/search/indexer/replacer.js
 * @chapter A Retained Word Changes Its Physical Witness Without Leaving Its Place
 * @description Replaces one posting pointer while preserving list length and source ownership.
 */

const constants = require('../../../constants.js');
const Sequence = require('../../../structure/sequence/index.js');
const PhysicalIdentity = require('./phys_id.js');
const PhysCache = require('./physCache.js');

class TokenReplacer {
	static replace(db, indexHandle, token, oldPointer, newPointer) {
		const tokenList = indexHandle[token];
		if (!tokenList) return false;
		const state = tokenList[constants.SYMBOLS.INTERNALS] || tokenList;
		state.ensureResolved();
		const structPointer = state.nav?.resolveStructPtr?.();
		if (!structPointer) return false;
		const sequence = new Sequence(db.allocator, structPointer);
		const oldId = PhysicalIdentity.get(oldPointer);
		for (let index = 0; index < sequence.length(); index++) {
			const pointer = sequence.getPtr(index);
			if (!pointer || PhysicalIdentity.get(pointer) !== oldId) continue;
			// B"H §8.2: the old skipFree:true here was a no-op — the
			// sequence writer ignores it for numeric sets, and the
			// pointer being replaced is the RECORD body, owned by the
			// map path that already frees it (or holds it while postings
			// still reference it). Freeing it here would double-free
			// that body. It is removed so the code stops implying a
			// skipped free; the record body's retirement stays with
			// the map setter.
			state.writer.set(index, newPointer, {
				isPtr: true,
				skipIndexes: true
			});
			PhysCache.replaceTokenId(indexHandle, token, oldId, PhysicalIdentity.get(newPointer));
			return true;
		}
		return false;
	}
}

module.exports = TokenReplacer;
