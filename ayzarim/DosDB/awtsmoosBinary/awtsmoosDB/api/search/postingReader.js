// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postingReader.js
 * @module SearchPostingReader
 * @description
 * The Awtsmoos reads persisted token constellations without turning a common
 * Torah word into a process-sized array. Awtsmoos.com keeps only a bounded
 * candidate identity map, supporting strict intersection and broad lexical union
 * while persisted posting sequences remain the complete source of truth.
 */

const constants = require('../../constants.js');
const Sequence = require('../../structure/sequence/index.js');

/** Resolves one persisted token posting sequence and its cardinality. */
function descriptor(manager, indexMap, token) {
	if (!manager.db.has(indexMap, token)) return null;
	const list = indexMap[token];
	const soul = list?.[constants.SYMBOLS.INTERNALS] || list;
	if (!soul) return null;
	soul.ensureResolved();
	const pointer = soul.nav?.resolveStructPtr?.();
	if (!pointer) return null;
	const sequence = new Sequence(manager.db.allocator, pointer);
	return {
		token,
		sequence,
		length: Number(sequence.length() || 0)
	};
}

/** Reads at most the configured number of pointers from one posting list. */
function seedCandidates(manager, posting, maximum) {
	const limit = Math.min(posting.length, maximum);
	const candidates = new Map();
	for (let index = 0; index < limit; index++) {
		const pointer = posting.sequence.getPtr(index);
		if (!pointer) continue;
		candidates.set(manager._getPhysId(pointer), pointer);
	}
	return candidates;
}

/** Intersects one posting sequence against the bounded candidate identity map. */
function intersectCandidates(manager, candidates, posting) {
	if (!candidates.size) return candidates;
	const matched = new Set();
	for (let index = 0; index < posting.length; index++) {
		const pointer = posting.sequence.getPtr(index);
		if (!pointer) continue;
		const identity = manager._getPhysId(pointer);
		if (!candidates.has(identity)) continue;
		matched.add(identity);
		if (matched.size === candidates.size) break;
	}
	for (const identity of [...candidates.keys()]) {
		if (!matched.has(identity)) candidates.delete(identity);
	}
	return candidates;
}

/** Builds bounded AND-query candidates from the rarest token outward. */
function boundedPointers(manager, postings, maximum) {
	const ordered = [...postings].sort((left, right) => left.length - right.length);
	const seed = ordered[0];
	const candidates = seedCandidates(manager, seed, maximum);
	for (let index = 1; index < ordered.length && candidates.size; index++) {
		intersectCandidates(manager, candidates, ordered[index]);
	}
	return {
		pointers: [...candidates.values()],
		truncated: seed.length > maximum,
		seedLength: seed.length
	};
}

/** Builds bounded OR-query candidates, preferring rarer tokens before common ones. */
function boundedUnion(manager, postings, maximum) {
	const ordered = [...postings].sort((left, right) => left.length - right.length);
	const candidates = new Map();
	let scannedAll = true;
	for (const posting of ordered) {
		for (let index = 0; index < posting.length; index++) {
			const pointer = posting.sequence.getPtr(index);
			if (!pointer) continue;
			candidates.set(manager._getPhysId(pointer), pointer);
			if (candidates.size < maximum) continue;
			scannedAll = index + 1 >= posting.length
				&& posting === ordered[ordered.length - 1];
			return {
				pointers: [...candidates.values()],
				truncated: !scannedAll,
				seedLength: ordered[0]?.length || 0
			};
		}
	}
	return {
		pointers: [...candidates.values()],
		truncated: false,
		seedLength: ordered[0]?.length || 0
	};
}

module.exports = {
	boundedPointers,
	boundedUnion,
	descriptor,
	intersectCandidates,
	seedCandidates
};
