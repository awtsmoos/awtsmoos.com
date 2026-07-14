// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/liveHandle/writer/map_ops/deleter.js
 * @chapter The Name Is Unlinked Before Its Chamber Returns To Silence
 * @description
 * Performs capture, copy-on-write deletion, parent publication, index cleanup,
 * and former-value retirement inside one outer database generation. The
 * Awtsmoos keeps the removed value quarantined until the replacement map is
 * linked and verified, preventing a later explicit release from colliding with
 * an already refreshed complement.
 */

const keyEncoding = require('../../../../utils/keyEncoding.js');
const constants = require('../../../../constants.js');
const MapIndexer = require('./indexer.js');

class MapDeleter {
	constructor(mapWriter) {
		this.writer = mapWriter;
		this.common = mapWriter.common;
		this.handle = mapWriter.handle;
		this.db = mapWriter.db;
	}

	delete(key) {
		return this.db.batch(() => this._deleteWithinGeneration(key));
	}

	_deleteWithinGeneration(key) {
		const encodedKey = keyEncoding.encode(key);
		const structurePointer = this.common.resolveStructPtr();
		if (!structurePointer) return false;

		const path = this.handle.getPath();
		const searchIndexed = this.common.getSearchIndex(path);
		const vectorIndexed = this.common.getVectorIndex(path);
		const type = this._engineType();
		const engine = this.common.getEngine(structurePointer, type);
		const previous = MapIndexer.captureOldState(
			engine,
			encodedKey,
			this.common,
			this.handle,
			searchIndexed,
			vectorIndexed
		);
		const result = engine.delete(encodedKey);
		const success = typeof result === 'boolean'
			? result
			: Boolean(result && result.success);
		this.common.checkAutoCompact(engine, type);
		if (!success) return false;

		MapIndexer.processDelete(
			this.db,
			path,
			key,
			previous.oldPtr,
			previous.oldVal,
			searchIndexed,
			vectorIndexed
		);
		if (previous.oldPtr && !searchIndexed && !vectorIndexed) {
			this.db.allocator.releasePointer(previous.oldPtr);
		}
		return true;
	}

	_engineType() {
		const types = constants.VAL_TYPE;
		if (this.handle.type === types.DICTIONARY || this.handle.type === types.OBJECT) {
			return types.DICTIONARY;
		}
		return types.MAP;
	}
}

module.exports = MapDeleter;
