// B"H

/**
 * @file api/vector/mutation.js
 * @chapter Replacement Crosses One Registry Generation
 * @description Wraps insertion, deletion, and same-key replacement in one registry transaction.
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

function replace(manager, path, index, key, vector, payload) {
	return manager.db.batch(() => withRegistry(index, () => {
		index.delete(key);
		const id = index.insert(key, vector, payload);
		manager.persistIndex(path, index);
		return id;
	}));
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
	replace,
	withRegistry
};
