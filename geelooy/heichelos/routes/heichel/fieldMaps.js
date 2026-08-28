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
		seriesId: true,
		createdAt: true,
		dayuh: true
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
