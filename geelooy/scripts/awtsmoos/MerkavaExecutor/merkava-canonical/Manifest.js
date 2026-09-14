//B"H
//Boruch Hashem
//Blessed be He

const { decodeUtf8, encodeUtf8 } = require('./Bytes.js');

const MANIFEST_SCHEMA = 'awtsmoos.merkava.manifest.v1';

/**
 * Produces deterministic manifest bytes with stable key ordering.
 * The manifest describes execution encoding and required host capabilities;
 * it never substitutes for the verifier or grants native permissions itself.
 * @param {object} input Manifest fields.
 * @returns {Uint8Array} Canonical UTF-8 JSON bytes.
 */
function encodeManifest(input = {}) {
	const manifest = {
		capabilities: sortedStrings(input.capabilities || []),
		entry: String(input.entry || '/index.html'),
		programEncoding: String(input.programEncoding || 'merkava-v1'),
		schema: MANIFEST_SCHEMA,
		targets: sortedStrings(input.targets || [])
	};
	return encodeUtf8(JSON.stringify(manifest));
}

/**
 * Reads and validates a canonical manifest section.
 * @param {Uint8Array|Buffer|ArrayBuffer|number[]} bytes Manifest bytes.
 * @returns {object} Validated manifest.
 */
function decodeManifest(bytes) {
	const value = JSON.parse(decodeUtf8(bytes));
	if (value?.schema !== MANIFEST_SCHEMA) {
		throw new Error('merkava_manifest_schema');
	}
	if (!Array.isArray(value.capabilities) || !Array.isArray(value.targets)) {
		throw new Error('merkava_manifest_arrays');
	}
	if (!value.entry || typeof value.programEncoding !== 'string') {
		throw new Error('merkava_manifest_fields');
	}
	return value;
}

/** @returns {string[]} */
function sortedStrings(values) {
	return [...new Set(values.map(value => String(value)))].sort();
}

module.exports = {
	MANIFEST_SCHEMA,
	decodeManifest,
	encodeManifest
};
