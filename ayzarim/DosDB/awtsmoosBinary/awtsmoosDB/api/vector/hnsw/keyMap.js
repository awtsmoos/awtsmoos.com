// B"H

/**
 * @file api/vector/hnsw/keyMap.js
 * @chapter One Adapter Reads Every Form Of The Persisted Key Ledger
 * @description Normalizes HNSW key-map reads, writes, removal, and enumeration.
 */

function get(handle, key) {
	const text = String(key);
	if (typeof handle?.get === 'function') {
		const value = handle.get(text);
		if (value !== undefined) return value;
	}
	if (handle && handle[text] !== undefined) return handle[text];
	const resolved = resolve(handle);
	if (resolved instanceof Map) return resolved.get(text);
	if (resolved && typeof resolved === 'object') return resolved[text];
	return undefined;
}

function entries(handle) {
	if (handle && typeof handle[Symbol.iterator] === 'function') {
		try { return Array.from(handle, normalizeEntry).filter(Boolean); }
		catch (_error) {}
	}
	const resolved = resolve(handle);
	if (resolved instanceof Map) return Array.from(resolved.entries(), normalizeEntry).filter(Boolean);
	if (resolved && typeof resolved === 'object') return Object.entries(resolved).map(normalizeEntry).filter(Boolean);
	return [];
}

function set(handle, key, value) {
	const text = String(key);
	if (typeof handle?.set === 'function') return handle.set(text, value);
	handle[text] = value;
	return value;
}

function remove(handle, key) {
	const text = String(key);
	if (typeof handle?.delete === 'function') return handle.delete(text);
	if (!handle) return false;
	return delete handle[text];
}

function resolve(handle) {
	try { return handle?.__resolve__?.(); }
	catch (_error) { return null; }
}

function normalizeEntry(entry) {
	if (!Array.isArray(entry) || entry.length < 2) return null;
	return [String(entry[0]), Number(entry[1])];
}

module.exports = {
	entries,
	get,
	remove,
	set
};
