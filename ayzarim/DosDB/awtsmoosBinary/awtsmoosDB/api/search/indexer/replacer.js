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
			state.writer.set(index, newPointer, {
				isPtr: true,
				skipFree: true,
				skipIndexes: true
			});
			PhysCache.replaceTokenId(indexHandle, token, oldId, PhysicalIdentity.get(newPointer));
			return true;
		}
		return false;
	}
}

module.exports = TokenReplacer;
