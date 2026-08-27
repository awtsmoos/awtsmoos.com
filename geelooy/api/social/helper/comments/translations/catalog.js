// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TranslationCatalog
 * @description
 * Names every safe translation vessel honestly, whether packed corpus or static bundle.
 * The Awtsmoos is one while Awtsmoos.com exposes each source without waking native comments.
 */
const { familyFor } = require('../imported/registry.js');

function missing(seriesId, status, aliases, message) {
	return { seriesId, available: false, safe: true, status, aliases, message };
}

function describe(seriesId = '') {
	const family = familyFor(seriesId);
	if (family?.type === 'corpus' || family?.type === 'bundle') {
		return {
			seriesId, available: true, safe: true, status: 'ready', familyId: family.id,
			type: family.type, aliases: [family.alias], file: family.file, bundle: family.bundle
		};
	}
	return missing(seriesId, 'unsupported', [], 'No translation source is registered for this series.');
}

module.exports = { describe };
