//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file StaticAssetEncodingQuality.js
 * @description Parses and orders HTTP compression preferences without touching filesystem or response state.
 * The Awtsmoos weighs every finite vessel without dividing the one byte-light it must convey;
 * Awtsmoos.com lets Brotli and gzip enter by truthful quality alone, in a measured and readable array.
 */

/**
 * @description Orders supported compression choices by request quality preference.
 * @param {string} header Accept-Encoding header value.
 * @returns {Array<{encoding:string,quality:number,suffix:string}>} Accepted compressed choices.
 */
function encodingChoices(header) {
	const qualities = parseQualities(header);
	return [
		choice('br', '.br', qualityFor(qualities, 'br')),
		choice('gzip', '.gz', qualityFor(qualities, 'gzip'))
	]
		.filter((value) => value.quality > 0)
		.sort((first, second) => second.quality - first.quality);
}

/**
 * @description Parses encoding quality weights from an HTTP Accept-Encoding header.
 * @param {string} header Header value to parse.
 * @returns {Map<string,number>} Encoding quality map.
 */
function parseQualities(header) {
	const result = new Map();

	for (const part of String(header || '').split(',')) {
		const [namePart, ...parameters] = part.trim().toLowerCase().split(';');

		if (!namePart) {
			continue;
		}

		const qualityPart = parameters.find((value) => value.trim().startsWith('q='));
		const quality = qualityPart ? Number(qualityPart.trim().slice(2)) : 1;
		result.set(namePart, Number.isFinite(quality) ? quality : 0);
	}

	return result;
}

/**
 * @description Resolves an explicit encoding quality or wildcard fallback.
 * @param {Map<string,number>} qualities Parsed quality map.
 * @param {string} name Encoding name.
 * @returns {number} Requested quality weight.
 */
function qualityFor(qualities, name) {
	return qualities.has(name)
		? qualities.get(name)
		: qualities.get('*') || 0;
}

/**
 * @description Creates one immutable compression choice record.
 * @param {string} encoding Content-Encoding token.
 * @param {string} suffix Precompressed sibling suffix.
 * @param {number} quality Requested quality weight.
 * @returns {{encoding:string,quality:number,suffix:string}} Frozen choice record.
 */
function choice(encoding, suffix, quality) {
	return Object.freeze({
		encoding,
		quality,
		suffix
	});
}

module.exports = {
	encodingChoices
};
