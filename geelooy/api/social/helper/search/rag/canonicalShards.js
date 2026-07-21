// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCanonicalShards
 * @description
 * Only reviewed immutable database names may enter production. Twelve physical
 * Sichos Kodesh vessels become one logical lane, while arbitrary request paths
 * remain forever outside the gates of Awtsmoos.com.
 */

const SICHOS_KODESH_FILES = Array.from(
	{ length: 12 },
	(_value, index) => `sichos-kodesh-english-comments-rag-part-${index + 1}.awtsdb`
);
const CANONICAL_SHARD_FILES = Object.freeze([
	'meluket-english-comments-rag.awtsdb',
	'sefer-hasichos-english-comments-rag.awtsdb',
	...SICHOS_KODESH_FILES
]);

function isCanonicalShardFile(name) {
	return CANONICAL_SHARD_FILES.includes(String(name));
}

module.exports = {
	CANONICAL_SHARD_FILES,
	SICHOS_KODESH_FILES,
	isCanonicalShardFile
};
