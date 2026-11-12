// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fieldMaps.js
 * @description
 * The Awtsmoos asks each API only for the vessel it truly needs, while Awtsmoos.com keeps route data narrow and bright;
 * small property maps reveal enough identity for shell and reader without dragging unseen worlds into every request in flight.
 */

/**
 * @description Encodes one property map for an Awtsmoos API query.
 * @param {string} mapName Query parameter name.
 * @param {object} map Property selection map.
 * @returns {string} URL-encoded query string.
 */
function queryMap(mapName, map) {
	return new URLSearchParams({ [mapName]: JSON.stringify(map) }).toString();
}

/**
 * @description Returns the public Heichel fields needed by semantic shell rendering.
 * @returns {string} Encoded property-map query.
 */
function heichelFields() {
	return queryMap('propertyMap', {
		id: true,
		name: true,
		title: true,
		description: true,
		author: true,
		createdAt: true,
		dayuh: true
	});
}

/**
 * @description Returns the post fields required by the initial server reader.
 * @returns {string} Encoded property-map query.
 */
function postFields() {
	return queryMap('propertyMap', {
		id: true,
		title: true,
		content: true,
		author: true,
		parentSeriesId: true,
		createdAt: true,
		dayuh: true,
		// B"H batch 27d: packed posts carry their text as phraseTranslations
		// (+ a real footnotes[]); without them in the first-byte projection
		// the server sefer can never render and first paint waits on the API.
		phraseTranslations: true,
		footnotes: true,
		// B"H batch 49 (defect 13): the 3 Hebrew-only posts (5752 _000,
		// _035b, _042) have ZERO translation rows, so the translations
		// path renders nothing and the batch-41 units fallback never
		// fired — because this projection stripped `units`, the public
		// API returned only postId/seriesId/title. Include `units` so
		// the render can fall back to the post doc's own Hebrew units
		// (5 / 26 / 39 units) and those posts show their Hebrew instead
		// of the empty shell. No English is invented — units without
		// English render Hebrew only.
		units: true
	});
}

/**
 * @description Returns the alias identity fields used beside a rendered post.
 * @returns {string} Encoded property-map query.
 */
function aliasFields() {
	return queryMap('propertyMap', {
		id: true,
		name: true,
		title: true,
		description: true
	});
}

module.exports = {
	aliasFields,
	heichelFields,
	postFields,
	queryMap
};
