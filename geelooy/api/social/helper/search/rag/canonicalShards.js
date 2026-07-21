// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCanonicalShards
 * @description
 * Awtsmoos.com reveals only these reviewed immutable databases. The two Sichos
 * Kodesh vessels are one logical lane and no request can name an arbitrary path.
 */

const CANONICAL_SHARD_FILES = Object.freeze([
	'meluket-english-comments-rag.awtsdb',
	'sefer-hasichos-english-comments-rag.awtsdb',
	'sichos-kodesh-english-comments-rag-part-1.awtsdb',
	'sichos-kodesh-english-comments-rag-part-2.awtsdb'
]);

function isCanonicalShardFile(name) {
	return CANONICAL_SHARD_FILES.includes(String(name));
}

module.exports = {
	CANONICAL_SHARD_FILES,
	isCanonicalShardFile
};
