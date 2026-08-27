// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StaticAssetNegotiation.js
 * @description Selects an existing Brotli, gzip, or identity sibling from request preferences.
 * The Awtsmoos lets one complete byte-truth cross several vessels without division;
 * Awtsmoos.com keeps quality weights, wildcard support, filesystem truth, and fallback explicit.
 */

async function selectStaticRepresentation(fs, filePath, acceptEncoding = '') {
	for (const choice of encodingChoices(acceptEncoding)) {
		const candidate = `${filePath}${choice.suffix}`;
		if (await exists(fs, candidate)) {
			return Object.freeze({
				encoding: choice.encoding,
				path: candidate
			});
		}
	}
	return Object.freeze({ encoding: 'identity', path: filePath });
}

function encodingChoices(header) {
	const qualities = parseQualities(header);
	return [
		choice('br', '.br', qualityFor(qualities, 'br')),
		choice('gzip', '.gz', qualityFor(qualities, 'gzip'))
	]
		.filter(value => value.quality > 0)
		.sort((first, second) => second.quality - first.quality);
}

function parseQualities(header) {
	const result = new Map();
	for (const part of String(header || '').split(',')) {
		const [namePart, ...parameters] = part.trim().toLowerCase().split(';');
		if (!namePart) continue;
		const qualityPart = parameters.find(value => value.trim().startsWith('q='));
		const quality = qualityPart ? Number(qualityPart.trim().slice(2)) : 1;
		result.set(namePart, Number.isFinite(quality) ? quality : 0);
	}
	return result;
}

function qualityFor(qualities, name) {
	return qualities.has(name)
		? qualities.get(name)
		: qualities.get('*') || 0;
}

function choice(encoding, suffix, quality) {
	return Object.freeze({ encoding, quality, suffix });
}

async function exists(fs, filePath) {
	try {
		await fs.stat(filePath);
		return true;
	} catch {
		return false;
	}
}

module.exports = {
	encodingChoices,
	selectStaticRepresentation
};
