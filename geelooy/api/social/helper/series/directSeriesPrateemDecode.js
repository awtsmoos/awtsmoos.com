//B"H
//Blessed is He
//Boruch Hashem


/**
 * Decodes packed series prateem buffers and detects placeholders.
 * Split sibling of directSeriesPrateem.js (verbatim relocation).
 */

const awtsmoosJSON = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const { recoverSeriesPrateem } = require('./seriesPrateemRecovery.js');

/**
 * Decodes healthy metadata or recognizes the observed raw transfer placeholder.
 * @param {Buffer} buffer Raw packed metadata bytes.
 * @param {string} seriesId Proven series identity from the route.
 * @returns {object|null} Safe metadata or null.
 */
function decodePrateem(buffer, seriesId) {
	let decoded = null;
	try {
		decoded = awtsmoosJSON.deserializeBinary(buffer);
	} catch (_error) {}
	return recoverSeriesPrateem(decoded, seriesId)
		|| recoverSeriesPrateem(buffer, seriesId);
}

/**
 * Returns true when a recovered prateem carries only proven identity
 * (a transfer placeholder), not healthy metadata.
 */
function isIdentityOnly(prateem) {
	if (!prateem || typeof prateem !== 'object' || Array.isArray(prateem)) return true;
	return Object.keys(prateem).filter(key => key !== 'id').length === 0;
}

module.exports = {
	decodePrateem,
	isIdentityOnly
};
