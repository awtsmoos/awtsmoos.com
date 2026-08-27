//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file StaticAssetNegotiation.js
 * @description Selects the best accepted static representation only after compression freshness is proven.
 * The Awtsmoos lets one source-light enter many vessels without allowing an older garment to hide a newer day;
 * Awtsmoos.com joins request preference to filesystem truth so Brotli and gzip serve only what the identity source can faithfully say.
 */

const {
	encodingChoices
} = require('./StaticAssetEncodingQuality.js');
const {
	isFreshRepresentation,
	statOrNull
} = require('./StaticAssetFreshness.js');

/**
 * @description Selects the highest-quality accepted compressed sibling that is nonempty and at least as fresh as identity.
 * @param {object} fs Promise-based filesystem authority exposing stat.
 * @param {string} filePath Canonical identity representation path.
 * @param {string} acceptEncoding Request Accept-Encoding header.
 * @returns {Promise<{encoding:string,path:string}>} Frozen selected representation record.
 */
async function selectStaticRepresentation(fs, filePath, acceptEncoding = '') {
	const sourceStats = await statOrNull(fs, filePath);

	for (const choice of encodingChoices(acceptEncoding)) {
		const candidatePath = `${filePath}${choice.suffix}`;
		const candidateStats = await statOrNull(fs, candidatePath);

		if (!isFreshRepresentation(sourceStats, candidateStats)) {
			continue;
		}

		return Object.freeze({
			encoding: choice.encoding,
			path: candidatePath
		});
	}

	return Object.freeze({
		encoding: 'identity',
		path: filePath
	});
}

module.exports = {
	encodingChoices,
	selectStaticRepresentation
};
