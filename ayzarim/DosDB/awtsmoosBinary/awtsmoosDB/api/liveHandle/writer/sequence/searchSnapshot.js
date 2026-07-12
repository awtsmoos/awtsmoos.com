// B"H

/**
 * @file api/liveHandle/writer/sequence/searchSnapshot.js
 * @chapter The Former Value Is Remembered Before Its Vessel Is Replaced
 * @description
 * Converts a LiveHandle or ordinary value into an immutable searchable snapshot
 * before sequence mutation can redirect or free the former physical pointer.
 */

function snapshotSearchValue(value, seen = new WeakMap(), depth = 0) {
	if (value === null || value === undefined) return value;
	if (depth > 100) return null;
	const type = typeof value;
	if (type !== 'object' && type !== 'function') return value;
	if (type === 'function' && typeof value.__resolve__ === 'function') {
		try { return snapshotSearchValue(value.__resolve__(), seen, depth + 1); }
		catch (_error) { return null; }
	}
	if (Buffer.isBuffer(value) || ArrayBuffer.isView(value) || value instanceof Date || value instanceof RegExp) {
		return value;
	}
	if (seen.has(value)) return seen.get(value);
	if (Array.isArray(value)) {
		const output = [];
		seen.set(value, output);
		for (const item of value) output.push(snapshotSearchValue(item, seen, depth + 1));
		return output;
	}
	if (value instanceof Map) {
		const output = [];
		seen.set(value, output);
		for (const [key, item] of value) {
			output.push(snapshotSearchValue(key, seen, depth + 1));
			output.push(snapshotSearchValue(item, seen, depth + 1));
		}
		return output;
	}
	if (value instanceof Set) {
		const output = [];
		seen.set(value, output);
		for (const item of value) output.push(snapshotSearchValue(item, seen, depth + 1));
		return output;
	}
	const output = {};
	seen.set(value, output);
	for (const key of Object.keys(value)) {
		if (!key.startsWith('__')) output[key] = snapshotSearchValue(value[key], seen, depth + 1);
	}
	return output;
}

module.exports = snapshotSearchValue;
