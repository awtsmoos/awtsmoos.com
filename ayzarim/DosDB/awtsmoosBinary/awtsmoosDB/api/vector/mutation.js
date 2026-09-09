// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/mutation.js
 * @module VectorMutationGeneration
 * @description
 * The Awtsmoos lets ordinary vector mutations own one short registry generation,
 * while an explicit immutable builder may hold a larger bounded generation open.
 * Nested mutations never seal a bulk scope they did not create; Awtsmoos.com can
 * therefore micro-batch HNSW graph persistence without weakening normal writes.
 */

/** Inserts one vector while respecting externally owned registry bulk state. */
function insert(manager, path, index, key, vector, payload) {
	return manager.db.batch(() => withRegistry(index, () => {
		const id = index.insert(key, vector, payload);
		manager.persistIndex(path, index);
		return id;
	}));
}

/** Removes one vector through the same registry ownership covenant. */
function remove(manager, index, key) {
	return manager.db.batch(() => withRegistry(index, () => index.delete(key)));
}

/** Replaces one vector without stealing an outer immutable-build generation. */
function replace(manager, path, index, key, vector, payload) {
	return manager.db.batch(() => withRegistry(index, () => {
		index.delete(key);
		const id = index.insert(key, vector, payload);
		manager.persistIndex(path, index);
		return id;
	}));
}

/**
 * Runs one graph mutation inside a registry generation.
 * @description
 * Ownership is explicit: when a caller already opened bulk mode, this helper is
 * only a guest and must neither commit nor abort that outer generation. When no
 * generation exists, the helper creates and seals the familiar atomic mutation.
 * @returns {*} The mutation result from the supplied operation.
 */
function withRegistry(index, operation) {
	const ownsGeneration = index.registry.bulk !== true;
	if (ownsGeneration) index.registry.beginBulk();
	try {
		const result = operation();
		if (ownsGeneration) index.registry.commitBulk();
		return result;
	} catch (error) {
		if (ownsGeneration) index.registry.abortBulk();
		throw error;
	}
}

module.exports = {
	insert,
	remove,
	replace,
	withRegistry
};
