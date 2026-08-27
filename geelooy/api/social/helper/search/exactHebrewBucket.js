// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewBucket
 * @description
 * Canonical v3 hashing and compressed-blob normalization remain isolated from
 * corpus loading, JSON slicing, and public response shaping.
 */

function hashText(text) {
	let hash = 2166136261;
	for (const character of String(text || '')) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function bucket(text, count = 256) {
	return `b${String(hashText(text) % count).padStart(3, '0')}`;
}

function blobBuffer(value) {
	if (Buffer.isBuffer(value)) return value;
	return Buffer.from(value?.data || value || []);
}

function codedError(code, detail) {
	const error = new Error(`Exact Hebrew v3 error: ${code} (${detail})`);
	error.code = code;
	return error;
}

module.exports = {
	blobBuffer,
	bucket,
	codedError,
	hashText
};
