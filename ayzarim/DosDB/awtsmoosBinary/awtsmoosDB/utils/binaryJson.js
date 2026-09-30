// B"H

/**
 * @file utils/binaryJson.js
 * @chapter The Letter Was Never Flattened Into A String
 * @description
 * The single sanctioned replacement for JSON.stringify / JSON.parse anywhere
 * in the database system. Hard rule (Yaakov): JSON.stringify must NEVER appear
 * in the database system. Every serialization goes through AwtsmoosBinaryJSON.
 *
 * encode(value) -> Buffer   (binary, exact bytes)
 * decode(buffer) -> value    (inverse of encode)
 * encodeText(value) -> string (base64 of encode; for logs and line protocols)
 * decodeText(string) -> value
 */

const path = require('path');

let _binary = null;
function binary() {
	if (!_binary) {
		_binary = require(path.join(__dirname, '..', '..', 'awtsmoosBinaryJSON', 'index.js'));
	}
	return _binary;
}

const PRIMITIVE_WRAPPER_KEY = '__awtsmoosPrimitiveValue__';

function isContainer(value) {
	return value !== null && typeof value === 'object';
}

function encode(value) {
	if (isContainer(value)) return binary().serializeJSON(value);
	return binary().serializeJSON({ [PRIMITIVE_WRAPPER_KEY]: value });
}

function decode(buffer) {
	if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer);
	const out = binary().deserializeBinary(buffer);
	if (
		out && typeof out === 'object' && !Array.isArray(out) &&
		Object.keys(out).length === 1 &&
		Object.prototype.hasOwnProperty.call(out, PRIMITIVE_WRAPPER_KEY)
	) {
		return out[PRIMITIVE_WRAPPER_KEY];
	}
	return out;
}

function encodeText(value) {
	return encode(value).toString('base64');
}

function decodeText(text) {
	return decode(Buffer.from(String(text || ''), 'base64'));
}

module.exports = {
	decode,
	decodeText,
	encode,
	encodeText
};
