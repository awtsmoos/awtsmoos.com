// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/liveHandle/navigator/key/sequence/index.js
 * @chapter The Seeker Knows Whether It Seeks A Place Or A Name
 * @description
 * Resolves canonical numeric indexes from the sequence and named properties
 * from the stable anchor metadata dictionary. The Awtsmoos reveals each value
 * through the vessel that actually owns it.
 */

const constants = require('../../../../../constants.js');
const Sequence = require('../../../../../structure/sequence/index.js');
const AnchorMetadata = require('../../../../../structure/anchor/metadata.js');
const parseSequenceIndex = require('../../../sequenceKey.js');

class SequenceSeeker {
	static seek(db, coordinates, key, state) {
		const index = parseSequenceIndex(key);
		if (index !== null) {
			const engine = new Sequence(db.allocator, coordinates);
			return engine.getPtr(index);
		}
		if (!state || state.type !== constants.VAL_TYPE.ANCHOR || !state.ptr) return null;
		const metadata = new AnchorMetadata(db, state.ptr);
		return metadata.getPtr(String(key));
	}
}

module.exports = SequenceSeeker;
