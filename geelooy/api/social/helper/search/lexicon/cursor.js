// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconCursor
 * @description
 * The Awtsmoos seals one tiny lexical continuation into an opaque base64url vessel without JSON or corpus memory;
 * Awtsmoos.com validates every shard, source, word, and exact key before a cursor may guide the next bounded page.
 */

const SAFE_TOKEN = /^[0-9a-f]{4,6}$/;
const SAFE_SOURCE = /^[a-z0-9-]{1,64}$/;
const SEPARATOR = '\u001f';
const VERSION = '1';

/** Creates the one public error shape used for malformed or stale lexical cursors. */
function cursorError() {
	const error = new Error('invalid_lexicon_cursor');
	error.code = 'INVALID_LEXICON_CURSOR';
	return error;
}

/** Bounds and validates one decoded cursor tuple before it can reach a shard path. */
function validateTuple(tuple) {
	if (!tuple || tuple.length !== 5 || tuple[0] !== VERSION) throw cursorError();
	const [, token, sourceId, normalized, key] = tuple;
	if (!SAFE_TOKEN.test(token) || !SAFE_SOURCE.test(sourceId)) throw cursorError();
	if (!normalized || normalized.length > 96 || !key || key.length > 256) throw cursorError();
	return { token, sourceId, normalized, key };
}

/** Encodes one lexical continuation without serializing a JSON document. */
function encodeLexiconCursor(value) {
	if (!value) return '';
	const tuple = validateTuple([
		VERSION,
		String(value.token || ''),
		String(value.sourceId || ''),
		String(value.normalized || ''),
		String(value.key || '')
	]);
	const plain = [VERSION, tuple.token, tuple.sourceId, tuple.normalized, tuple.key].join(SEPARATOR);
	return Buffer.from(plain, 'utf8').toString('base64url');
}

/** Decodes and validates one opaque lexical continuation; empty input means first page. */
function decodeLexiconCursor(value) {
	if (!value) return null;
	try {
		const plain = Buffer.from(String(value), 'base64url').toString('utf8');
		if (!plain || plain.length > 512) throw cursorError();
		return validateTuple(plain.split(SEPARATOR));
	} catch (error) {
		if (error?.code === 'INVALID_LEXICON_CURSOR') throw error;
		throw cursorError();
	}
}

module.exports = {
	decodeLexiconCursor,
	encodeLexiconCursor
};
