// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/managerMutation.js
 * @chapter One Mutation Path Replaces One Reachable Vector Generation
 * @description Normalizes vector input and delegates atomic graph mutations while
 * keeping the public manager small and readable.
 */

const mutation = require('./mutation.js');
const { vectorOf } = require('./query.js');

function insert(manager, path, key, vector, payload) {
	const index = manager.getIndex(path);
	const normalized = vectorOf(vector);
	return index && normalized
		? mutation.insert(manager, path, index, key, normalized, payload)
		: null;
}

function remove(manager, path, key) {
	const index = manager.getIndex(path);
	return index ? mutation.remove(manager, index, key) : false;
}

function replace(manager, path, key, vector, payload) {
	const index = manager.getIndex(path);
	const normalized = vectorOf(vector);
	return index && normalized
		? mutation.replace(manager, path, index, key, normalized, payload)
		: null;
}

module.exports = {
	insert,
	remove,
	replace
};
