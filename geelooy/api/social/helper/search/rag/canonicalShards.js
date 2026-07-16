// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCanonicalShards
 * @description
 * Exactly two persisted vessels carry public RAG: all Likkutei Sichos and all
 * Sefer HaSichos. The Awtsmoos gathers many historical experiments into memory,
 * yet Awtsmoos.com opens only these final complete databases for living search.
 */

const CANONICAL_SHARD_FILES = Object.freeze([
	'meluket-english-comments-rag.awtsdb',
	'sefer-hasichos-english-comments-rag.awtsdb'
]);

function isCanonicalShardFile(name) {
	return CANONICAL_SHARD_FILES.includes(String(name));
}

module.exports = {
	CANONICAL_SHARD_FILES,
	isCanonicalShardFile
};
