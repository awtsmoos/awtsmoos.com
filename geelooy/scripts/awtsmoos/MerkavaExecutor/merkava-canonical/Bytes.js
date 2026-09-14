//B"H
//Boruch Hashem
//Blessed be He

/**
 * Converts supported binary values into a detached Uint8Array view.
 * Detaching through `slice` prevents callers from mutating verified bytes later.
 * @param {Uint8Array|Buffer|ArrayBuffer|number[]} value Binary input.
 * @returns {Uint8Array} Detached bytes.
 */
function asBytes(value) {
	if (value instanceof Uint8Array) {
		return value.slice();
	}
	if (value instanceof ArrayBuffer) {
		return new Uint8Array(value).slice();
	}
	if (Array.isArray(value)) {
		return Uint8Array.from(value);
	}
	throw new TypeError('merkava_bytes_required');
}

/**
 * Encodes portable UTF-8 metadata without Node-only Buffer assumptions.
 * @param {string} value Source text.
 * @returns {Uint8Array} UTF-8 bytes.
 */
function encodeUtf8(value) {
	return new TextEncoder().encode(String(value ?? ''));
}

/**
 * Decodes portable UTF-8 metadata in fatal mode so corrupt manifests fail closed.
 * @param {Uint8Array|Buffer|ArrayBuffer|number[]} value UTF-8 bytes.
 * @returns {string} Decoded text.
 */
function decodeUtf8(value) {
	return new TextDecoder('utf-8', {
		fatal: true
	}).decode(asBytes(value));
}

/**
 * Returns the next four-byte boundary used by deterministic section placement.
 * @param {number} value Raw byte offset.
 * @returns {number} Aligned byte offset.
 */
function alignFour(value) {
	return (Number(value) + 3) & ~3;
}

module.exports = {
	alignFour,
	asBytes,
	decodeUtf8,
	encodeUtf8
};
