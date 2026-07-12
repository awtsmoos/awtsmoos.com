// B"H

/**
 * @file api/liveHandle/writer/sequence.js
 * @chapter The Sequence Scribe Delegates Each Mutation To One Focused Vessel
 * @description Compatibility facade for indexed set, push, splice, and delete operations.
 */

const setSequenceValue = require('./sequence/set.js');
const pushSequenceValue = require('./sequence/push.js');
const spliceSequence = require('./sequence/splice.js');

class SequenceWriter {
	constructor(common, builder) {
		this.common = common;
		this.builder = builder;
		this.db = common.db;
		this.handle = common.handle;
	}

	set(key, value, options) {
		return setSequenceValue(this, key, value, options);
	}

	push(value, options = {}) {
		return pushSequenceValue(this, value, options);
	}

	splice(start, deleteCount, ...items) {
		return spliceSequence(this, start, deleteCount, ...items);
	}

	delete(indexKey) {
		const index = Number.parseInt(indexKey, 10);
		if (Number.isNaN(index)) return false;
		if (this.db.sparseArrays?.has(this.handle, index)) {
			return this.db.sparseArrays.delete(this.handle, index);
		}
		this.splice(index, 1);
		return true;
	}
}

module.exports = SequenceWriter;
