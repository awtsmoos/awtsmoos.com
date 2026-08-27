// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/liveHandle/navigator/key/index.js
 * @chapter The Book Of Names Opens The Correct Vessel
 * @description
 * Resolves one child pointer according to the effective structure type. Anchored
 * sequences pass their stable soul to the sequence seeker so named metadata can
 * be found beside numeric positions. The Awtsmoos reveals each name without
 * confusing packed, sparse, mapped, or sequential worlds.
 */

const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');
const AnchorLogic = require('../anchor/index.js');
const FlatSeeker = require('./flat/index.js');
const SequenceSeeker = require('./sequence/index.js');
const MapSeeker = require('./map/index.js');
const PackedLive = require('../../../packed/liveObject.js');
const PackedArray = require('../../../packed/liveArray.js');

class KeyLogic {
	static resolveKey(state, key, structureCoordinates) {
		const type = this._effectiveType(state);
		const database = state.db;

		if (type === constants.VAL_TYPE.PACKED_OBJECT) {
			return this._packedResult(PackedLive.get(database, state.ptr, key));
		}
		if (type === constants.VAL_TYPE.PACKED_ARRAY) {
			return this._packedResult(PackedArray.get(database, state.ptr, key));
		}

		let valuePointer = null;
		if (type === constants.VAL_TYPE.SMART_OBJECT || type === constants.VAL_TYPE.SMART_ARRAY) {
			valuePointer = FlatSeeker.seek(database, type, structureCoordinates, key);
			if (!valuePointer && type === constants.VAL_TYPE.SMART_ARRAY && database.sparseArrays) {
				valuePointer = database.sparseArrays.getPtr(state, key);
			}
		} else if (this._isSequence(type)) {
			valuePointer = SequenceSeeker.seek(database, structureCoordinates, key, state);
			if (!valuePointer && database.sparseArrays) {
				valuePointer = database.sparseArrays.getPtr(state, key);
			}
		} else {
			valuePointer = MapSeeker.seek(database, type, structureCoordinates, key);
		}

		if (!valuePointer) return null;
		return {
			ptr: valuePointer,
			type: SmartPointer.getType(valuePointer)
		};
	}

	static _effectiveType(state) {
		if (state.type !== constants.VAL_TYPE.ANCHOR) return state.type;
		return AnchorLogic.resolveInnerType(state) || constants.VAL_TYPE.DICTIONARY;
	}

	static _isSequence(type) {
		return [
			constants.VAL_TYPE.SEQUENCE,
			constants.VAL_TYPE.ARRAY,
			constants.VAL_TYPE.SET,
			constants.VAL_TYPE.JS_SET
		].includes(type);
	}

	static _packedResult(result) {
		return result.hit ? { virtualPacked: true, value: result.value } : null;
	}
}

module.exports = KeyLogic;
