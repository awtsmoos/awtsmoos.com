// B"H

/**
 * @file core/verifier/tokenReaders.js
 * @chapter The Token Speaks In Its Own Alphabet
 * @description
 * Decodes modern binary ABLB and ATXT tokens first, then preserves the legacy
 * JSON doorway. A verifier must understand the stored format rather than free
 * bytes merely because their language was mistaken.
 */

const BlobToken = require('../../api/blob/tokenCodec.js');
const TextToken = require('../../api/text/tokenCodec.js');

function parseLegacyJson(raw) {
	return raw ? JSON.parse(raw.toString('utf8')) : null;
}

function readBlobToken(raw) {
	const binary = BlobToken.decode(raw);
	return binary || parseLegacyJson(raw);
}

function readTextToken(raw) {
	const binary = TextToken.decode(raw);
	return binary || parseLegacyJson(raw);
}

module.exports = {
	readBlobToken,
	readTextToken
};
