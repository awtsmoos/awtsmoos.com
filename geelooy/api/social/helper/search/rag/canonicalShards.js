// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCanonicalShards
 * @description
 * Two complete live libraries and eight reviewed Sichos Kodesh parts may answer
 * public text search. Four unfinished parts remain named but unpublished, so the
 * API can reveal a truthful partial lane without pretending the corpus is whole.
 */

const SICHOS_KODESH_EXPECTED_PARTS = 12;
const SICHOS_KODESH_PUBLISHED_PARTS = 8;
const SICHOS_KODESH_FILES = Object.freeze(Array.from(
	{ length: SICHOS_KODESH_EXPECTED_PARTS },
	(_value, index) => `sichos-kodesh-english-comments-rag-part-${index + 1}.awtsdb`
));
const PUBLISHED_SICHOS_KODESH_FILES = Object.freeze(
	SICHOS_KODESH_FILES.slice(0, SICHOS_KODESH_PUBLISHED_PARTS)
);
const CANONICAL_SHARD_FILES = Object.freeze([
	'meluket-english-comments-rag.awtsdb',
	'sefer-hasichos-english-comments-rag.awtsdb'
]);

function isCanonicalShardFile(name) {
	return CANONICAL_SHARD_FILES.includes(String(name))
		|| PUBLISHED_SICHOS_KODESH_FILES.includes(String(name));
}

module.exports = {
	CANONICAL_SHARD_FILES,
	PUBLISHED_SICHOS_KODESH_FILES,
	SICHOS_KODESH_EXPECTED_PARTS,
	SICHOS_KODESH_FILES,
	SICHOS_KODESH_PUBLISHED_PARTS,
	isCanonicalShardFile
};
