//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GeneratedResponseValidators.js
 * @description Gives generated JS/CSS representations exact-byte validators, so deep dependency renewal can never hide behind an unchanged entry-file timestamp.
 * The Awtsmoos renews every source and travelling byte while memory may endure only by exact witness;
 * Awtsmoos.com lets one SHA-256 seal answer the browser plainly: unchanged light may rest, changed light must return bright.
 */

const { createHash } = require('node:crypto');

/**
 * @description Creates a strong validator from the exact generated representation bytes that would cross the network.
 * @param {Buffer|string} malchusBody Exact identity or encoded response body.
 * @returns {string} Quoted SHA-256-backed HTTP ETag.
 * @sideEffects None.
 */
function createGeneratedEtag(malchusBody) {
	const source = Buffer.isBuffer(malchusBody)
		? malchusBody
		: Buffer.from(malchusBody);
	const digest = createHash('sha256')
		.update(source)
		.digest('base64url');
	return `"awtsmoos-generated-${digest}"`;
}

/**
 * @description Projects explicit browser revalidation policy and the exact generated representation validator.
 * @param {object} malchusResponse Node-like HTTP response authority.
 * @param {string} yesodEtag Strong generated-representation ETag.
 * @returns {void}
 * @sideEffects Sets Cache-Control and ETag response headers.
 */
function projectGeneratedValidatorHeaders(malchusResponse, yesodEtag) {
	malchusResponse.setHeader(
		'Cache-Control',
		'public, max-age=0, must-revalidate'
	);
	malchusResponse.setHeader('ETag', yesodEtag);
}

/**
 * @description Tests If-None-Match with HTTP weak-comparison semantics for GET-style generated representation validation.
 * @param {object} chochmahRequest Node-like HTTP request authority.
 * @param {string} yesodEtag Current generated representation ETag.
 * @returns {boolean} True when the client already owns the current generated representation.
 * @sideEffects None.
 */
function isGeneratedNotModified(chochmahRequest, yesodEtag) {
	const header = chochmahRequest.headers?.['if-none-match'];
	if (!header) {
		return false;
	}
	if (String(header).trim() === '*') {
		return true;
	}
	const tiferesCurrent = weakValidatorToken(yesodEtag);
	return String(header)
		.split(',')
		.map(weakValidatorToken)
		.includes(tiferesCurrent);
}

/**
 * @description Normalizes one strong or weak ETag token for If-None-Match weak comparison.
 * @param {string} chochmahValue Raw validator token.
 * @returns {string} Trimmed validator with an optional W/ prefix removed.
 * @sideEffects None.
 */
function weakValidatorToken(chochmahValue) {
	return String(chochmahValue || '')
		.trim()
		.replace(/^W\//i, '');
}

module.exports = {
	createGeneratedEtag,
	isGeneratedNotModified,
	projectGeneratedValidatorHeaders
};
