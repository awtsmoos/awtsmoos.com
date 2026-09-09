// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file adder.js
 * @module TokenPostingAdder
 * @description
 * The Awtsmoos binds one source pointer to each persisted token constellation.
 * Normal mutable databases retain physical duplicate protection; reviewed
 * append-only generation builders may bypass that cache because every source
 * pointer is newly created exactly once and every record token is already unique.
 */

const constants = require('../../../constants.js');
const PhysicalIdentity = require('./phys_id.js');
const PhysCache = require('./physCache.js');

/** Creates or resolves the native posting list for one lexical token. */
function postingList(db, indexHandle, token) {
	let list = indexHandle[token];
	if (!list || typeof list.push !== 'function') {
		db.createList(indexHandle, token);
		list = indexHandle[token];
	}
	if (!list) {
		throw new Error(`B"H search posting list unavailable: ${token}`);
	}
	const state = list[constants.SYMBOLS.INTERNALS] || list;
	state.ensureResolved();
	return state;
}

/** Appends a source pointer without wrapping it as ordinary Buffer payload data. */
function appendPointer(state, pointer) {
	state.writer.push(pointer, { isPtr: true });
}

class TokenAdder {
	/**
	 * Adds one posting while respecting mutable or append-only generation policy.
	 * @param {object} db Open AwtsmoosDB instance.
	 * @param {object} indexHandle Persisted token map handle.
	 * @param {string} token Canonical lexical token.
	 * @param {Buffer} pointer Physical source-record pointer.
	 * @returns {void}
	 */
	static add(db, indexHandle, token, pointer) {
		const state = postingList(db, indexHandle, token);
		if (db.search?.appendOnlyBuild === true) {
			appendPointer(state, pointer);
			return;
		}
		const identity = PhysicalIdentity.get(pointer);
		const seen = PhysCache.getTokenSet(db, indexHandle, token, state);
		if (seen.has(identity)) return;
		appendPointer(state, pointer);
		seen.add(identity);
	}
}

module.exports = TokenAdder;
