// B"H

/**
 * @file api/vector/mutation.js
 * @chapter One Mutation Produces One Registry Seal And One Metadata Crown
 * @description
 * Wraps dynamic HNSW insertion and deletion in a registry transaction. Parent
 * maps observe one registry-root change instead of every intermediate node save.
 */

function insert(manager, path, index, key, vector, payload) {
	return manager.db.batch(() => withRegistry(index, () => {
		const id = index.insert(key, vector, payload);
		manager.persistIndex(path, index);
		return id;
	}));
}

function remove(manager, index, key) {
	return manager.db.batch(() => withRegistry(index, () => index.delete(key)));
}

function withRegistry(index, operation) {
	index.registry.beginBulk();
	try {
		const result = operation();
		index.registry.commitBulk();
		return result;
	} catch (error) {
		index.registry.abortBulk();
		throw error;
	}
}

module.exports = {
	insert,
	remove,
	withRegistry
};
