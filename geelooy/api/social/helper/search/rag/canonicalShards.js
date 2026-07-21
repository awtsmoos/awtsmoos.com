// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCanonicalShards
 * @description
 * The Awtsmoos distinguishes vessels already revealed in production from
 * vessels still being formed in staging. Only the two reviewed live databases
 * may answer public requests; twelve Sichos Kodesh parts remain named here for
 * deployment tooling but are not canonical until their complete family is
 * deliberately promoted.
 */

const SICHOS_KODESH_FILES = Object.freeze(Array.from(
	{ length: 12 },
	(_value, index) => `sichos-kodesh-english-comments-rag-part-${index + 1}.awtsdb`
));

const CANONICAL_SHARD_FILES = Object.freeze([
	'meluket-english-comments-rag.awtsdb',
	'sefer-hasichos-english-comments-rag.awtsdb'
]);

function isCanonicalShardFile(name) {
	return CANONICAL_SHARD_FILES.includes(String(name));
}

module.exports = {
	CANONICAL_SHARD_FILES,
	SICHOS_KODESH_FILES,
	isCanonicalShardFile
};
