// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCanonicalShards
 * @description
 * Sealed single-file lanes and reviewed multipart corpora enter publication only
 * by explicit name. The Awtsmoos gives each corpus a boundary; Awtsmoos.com
 * discovers no unfinished file merely because it appears on disk.
 */

const SICHOS_KODESH_EXPECTED_PARTS = 12;
const SICHOS_KODESH_PUBLISHED_PARTS = 12;
const LIKKUTEI_SICHOS_RECORDS = 221043;
const LIKKUTEI_SICHOS_PART_SIZE = 8000;
const LIKKUTEI_SICHOS_EXPECTED_PARTS = Math.ceil(
	LIKKUTEI_SICHOS_RECORDS / LIKKUTEI_SICHOS_PART_SIZE
);
const SICHOS_KODESH_FILES = partFiles(
	'sichos-kodesh-english-comments-rag',
	SICHOS_KODESH_EXPECTED_PARTS
);
const LIKKUTEI_SICHOS_FILES = partFiles(
	'likkutei-sichos-english-comments-text',
	LIKKUTEI_SICHOS_EXPECTED_PARTS
);
const PUBLISHED_SICHOS_KODESH_FILES = Object.freeze(
	SICHOS_KODESH_FILES.slice(0, SICHOS_KODESH_PUBLISHED_PARTS)
);
const PUBLISHED_LIKKUTEI_SICHOS_FILES = Object.freeze([
	...LIKKUTEI_SICHOS_FILES
]);
const CANONICAL_SHARD_FILES = Object.freeze([
	'meluket-english-comments-rag.awtsdb',
	'sefer-hasichos-english-comments-rag.awtsdb',
	'tanach-hebrew-verses-rag.awtsdb'
]);

function partFiles(prefix, count) {
	return Object.freeze(Array.from(
		{ length: count },
		(_value, index) => `${prefix}-part-${index + 1}.awtsdb`
	));
}

function isCanonicalShardFile(name) {
	const value = String(name);
	return CANONICAL_SHARD_FILES.includes(value)
		|| PUBLISHED_SICHOS_KODESH_FILES.includes(value)
		|| PUBLISHED_LIKKUTEI_SICHOS_FILES.includes(value);
}

module.exports = {
	CANONICAL_SHARD_FILES,
	LIKKUTEI_SICHOS_EXPECTED_PARTS,
	LIKKUTEI_SICHOS_FILES,
	LIKKUTEI_SICHOS_PART_SIZE,
	LIKKUTEI_SICHOS_RECORDS,
	PUBLISHED_LIKKUTEI_SICHOS_FILES,
	PUBLISHED_SICHOS_KODESH_FILES,
	SICHOS_KODESH_EXPECTED_PARTS,
	SICHOS_KODESH_FILES,
	SICHOS_KODESH_PUBLISHED_PARTS,
	isCanonicalShardFile
};
