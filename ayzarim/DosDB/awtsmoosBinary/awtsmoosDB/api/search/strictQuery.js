// B"H

/**
 * @file api/search/strictQuery.js
 * @chapter Indexed Search Must Answer From Its Ledger Or Admit No Match
 * @description
 * Executes only against persisted token postings. Missing configuration throws;
 * missing tokens return an empty indexed result and never trigger a full scan.
 */

const constants = require('../../constants.js');
const tokenizer = require('./indexer/tokenizer.js');
const Sequence = require('../../structure/sequence/index.js');

function runIndexed(manager, handleOrPath, query) {
	manager.db.waitForIdle();
	const path = resolvePath(handleOrPath);
	if (!manager.isIndexed(path)) throw searchError(`path is not indexed: ${path}`);
	const tokens = [...tokenizer.tokenize(query)];
	if (!tokens.length) return [];
	const indexMap = manager.db.root.__sys_search__?.[path];
	if (!indexMap) throw searchError(`persisted index map is missing: ${path}`);
	let pointers = postings(manager, indexMap, tokens[0]);
	if (pointers === null) return [];

	for (let index = 1; index < tokens.length; index++) {
		const next = postings(manager, indexMap, tokens[index]);
		if (next === null) return [];
		const identities = new Set(next.map(pointer => manager._getPhysId(pointer)));
		pointers = pointers.filter(pointer => identities.has(manager._getPhysId(pointer)));
		if (!pointers.length) return [];
	}
	return pointers.map(pointer => manager._resolveForIndex(pointer));
}

function postings(manager, indexMap, token) {
	if (!manager.db.has(indexMap, token)) return null;
	const list = indexMap[token];
	const soul = list?.[constants.SYMBOLS.INTERNALS];
	if (!soul) throw searchError(`posting list has no soul: ${token}`);
	soul.ensureResolved();
	const pointer = soul.nav.resolveStructPtr();
	if (!pointer) throw searchError(`posting list has no structure: ${token}`);
	const sequence = new Sequence(manager.db.allocator, pointer);
	const output = [];
	for (let index = 0; index < sequence.length(); index++) {
		const item = sequence.getPtr(index);
		if (item) output.push(item);
	}
	return output;
}

function resolvePath(handleOrPath) {
	if (typeof handleOrPath === 'string') return handleOrPath;
	const soul = handleOrPath?.[constants.SYMBOLS.INTERNALS] || handleOrPath;
	return soul?.getPath?.() || '';
}

function searchError(message) {
	const error = new Error(`B"H indexed search error: ${message}`);
	error.code = 'AWTSMOOS_DB_SEARCH_INDEX_INVALID';
	return error;
}

module.exports = runIndexed;
