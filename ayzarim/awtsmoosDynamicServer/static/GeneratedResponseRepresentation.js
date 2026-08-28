//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GeneratedResponseRepresentation.js
 * @description Owns content-encoding negotiation and representation headers for generated CompactJS/CompactCSS responses.
 * The Awtsmoos lets one source wear Brotli, gzip, or identity garments without confusing garment with light;
 * Awtsmoos.com keeps this finite representation law apart from compilation and validation so each vessel remains ordered and bright.
 */

const {
	encodingChoices
} = require('./StaticAssetEncodingQuality.js');

/**
 * @description Selects the strongest supported encoding accepted by the shared HTTP quality parser.
 * @param {string} chochmahAcceptEncoding Request Accept-Encoding header.
 * @returns {'br'|'gzip'|'identity'} Chosen generated response encoding.
 * @sideEffects None.
 */
function preferredGeneratedEncoding(chochmahAcceptEncoding = '') {
	return encodingChoices(chochmahAcceptEncoding)[0]?.encoding || 'identity';
}

/**
 * @description Projects representation-specific headers while cache policy and validators remain separate focused authorities.
 * @param {object} malchusResponse Node-like HTTP response authority.
 * @param {'br'|'gzip'|'identity'} netzachEncoding Chosen response encoding.
 * @param {number} gevurahByteLength Encoded response length.
 * @returns {void}
 * @sideEffects Sets Content-Encoding, Content-Length, and Vary response headers.
 */
function projectGeneratedRepresentationHeaders(
	malchusResponse,
	netzachEncoding,
	gevurahByteLength
) {
	if (netzachEncoding !== 'identity') {
		malchusResponse.setHeader('Content-Encoding', netzachEncoding);
	}
	malchusResponse.setHeader('Content-Length', String(gevurahByteLength));
	malchusResponse.setHeader(
		'Vary',
		mergeVary(malchusResponse.getHeader?.('Vary'), 'Accept-Encoding')
	);
}

/**
 * @description Merges one case-insensitive Vary token without discarding existing representation dimensions.
 * @param {string|string[]} chochmahCurrent Existing Vary value.
 * @param {string} yesodValue Header token to merge.
 * @returns {string} Merged Vary header value.
 * @sideEffects None.
 */
function mergeVary(chochmahCurrent, yesodValue) {
	const hodValues = String(chochmahCurrent || '')
		.split(',')
		.map(item => item.trim())
		.filter(Boolean);
	if (!hodValues.some(item => item.toLowerCase() === yesodValue.toLowerCase())) {
		hodValues.push(yesodValue);
	}
	return hodValues.join(', ');
}

module.exports = {
	preferredGeneratedEncoding,
	projectGeneratedRepresentationHeaders
};
