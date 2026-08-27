// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/liveHandle/writer/sequence.js
 * @chapter The Sequence Scribe Guards Positions And Names
 * @description
 * Delegates numeric mutations to the ordered sequence and named-property
 * deletion to the stable anchor metadata dictionary. The Awtsmoos keeps both
 * faces of the list within one durable ownership law.
 */

const constants = require('../../../constants.js');
const AnchorMetadata = require('../../../structure/anchor/metadata.js');
const parseSequenceIndex = require('../sequenceKey.js');
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

	delete(key) {
		const index = parseSequenceIndex(key);
		if (index === null) return this._deleteNamedProperty(key);
		if (this.db.sparseArrays?.has(this.handle, index)) {
			return this.db.sparseArrays.delete(this.handle, index);
		}
		this.splice(index, 1);
		return true;
	}

	_deleteNamedProperty(key) {
		if (this.handle.type !== constants.VAL_TYPE.ANCHOR) return false;
		return this.db.batch(() => {
			const metadata = new AnchorMetadata(this.db, this.handle.ptr);
			return metadata.delete(String(key));
		});
	}
}

module.exports = SequenceWriter;
