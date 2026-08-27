// B"H

/**
 * @file api/search/indexer.js
 * @chapter Retained Words Change Witnesses Without Leaving Their Constellations
 * @description Coordinates exact add, remove, and in-place posting replacement operations.
 */

const constants = require('../../constants.js');
const operations = require('./indexer/ops.js');
const tokenDelta = require('./indexer/tokenDelta.js');

class SearchIndexer {
	constructor(db, systemIndex) {
		this.db = db;
		this.systemIndex = systemIndex;
	}

	updateIndex(path, newPointer, oldPointer, oldValue, newValue) {
		const delta = tokenDelta(oldValue, newValue);
		const indexHandle = this._getPathIndexHandle(path);
		if (!indexHandle) return;
		if (oldPointer) {
			for (const token of delta.removed) {
				operations.removeToken(this.db, indexHandle, token, oldPointer);
			}
		}
		if (newPointer) {
			for (const token of delta.added) {
				operations.addToken(this.db, indexHandle, token, newPointer);
			}
		}
		if (oldPointer && newPointer && !oldPointer.equals(newPointer)) {
			for (const token of delta.retained) {
				this.replaceRetained(indexHandle, token, oldPointer, newPointer);
			}
		}
	}

	replaceRetained(indexHandle, token, oldPointer, newPointer) {
		const replaced = operations.replaceToken(
			this.db,
			indexHandle,
			token,
			oldPointer,
			newPointer
		);
		if (replaced) return;
		operations.removeToken(this.db, indexHandle, token, oldPointer);
		operations.addToken(this.db, indexHandle, token, newPointer);
	}

	flush() {}

	_getPathIndexHandle(path) {
		let handle = this.systemIndex[path];
		if (!handle) {
			this.systemIndex[path] = new this.db.Map();
			handle = this.systemIndex[path];
		}
		const state = handle[constants.SYMBOLS.INTERNALS] || handle;
		state.ensureResolved(true);
		return state.self || state;
	}
}

module.exports = SearchIndexer;
