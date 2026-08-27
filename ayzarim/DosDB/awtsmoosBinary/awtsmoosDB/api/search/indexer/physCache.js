// B"H

/**
 * @file api/search/indexer/physCache.js
 * @chapter Physical Posting Identity Is Remembered Without Replacing Persistence
 * @description Caches token pointer identities and mirrors add, remove, replace, and rebuild events.
 */

const Sequence = require('../../../structure/sequence/index.js');
const PhysicalIdentity = require('./phys_id.js');

const byIndexHandle = new WeakMap();

function getTokenSet(db, indexHandle, token, listState) {
	let perIndex = byIndexHandle.get(indexHandle);
	if (!perIndex) {
		perIndex = new Map();
		byIndexHandle.set(indexHandle, perIndex);
	}
	if (perIndex.has(token)) return perIndex.get(token);
	const set = hydrateTokenSet(db, listState);
	perIndex.set(token, set);
	return set;
}

function hydrateTokenSet(db, listState) {
	const set = new Set();
	if (!listState) return set;
	try {
		listState.ensureResolved();
		const structPointer = listState.nav?.resolveStructPtr?.();
		if (!structPointer) return set;
		const sequence = new Sequence(db.allocator, structPointer);
		for (let index = 0; index < sequence.length(); index++) {
			const pointer = sequence.getPtr(index);
			if (pointer) set.add(PhysicalIdentity.get(pointer));
		}
	} catch (_error) {}
	return set;
}

function deleteTokenId(indexHandle, token, id) {
	byIndexHandle.get(indexHandle)?.get(token)?.delete(id);
}

function replaceTokenId(indexHandle, token, oldId, newId) {
	const set = byIndexHandle.get(indexHandle)?.get(token);
	if (!set) return;
	set.delete(oldId);
	set.add(newId);
}

function clearToken(indexHandle, token) {
	byIndexHandle.get(indexHandle)?.delete(token);
}

function clearIndex(indexHandle) {
	byIndexHandle.delete(indexHandle);
}

module.exports = {
	clearIndex,
	clearToken,
	deleteTokenId,
	getTokenSet,
	replaceTokenId
};
