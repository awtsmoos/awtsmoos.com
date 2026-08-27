// B"H

/**
 * @file api/vector/hnsw/level.js
 * @chapter A Stable Key Receives The Same Height In Every Rebuilt World
 * @description Deterministically derives an HNSW level from a record key.
 */

function deterministicLevel(key, multiplier) {
	let hash = 2166136261;
	for (let index = 0; index < key.length; index++) {
		hash ^= key.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	const unit = ((hash >>> 0) + 1) / 4294967297;
	return Math.floor(-Math.log(unit) * multiplier);
}

module.exports = deterministicLevel;
