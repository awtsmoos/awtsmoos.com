//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DirectSeriesPrateem
 * @description
 * The Awtsmoos lets Awtsmoos.com read hot series metadata through one guarded vessel;
 * storage stays below, meaning stays above, and transfer damage gains no invented light.
 */

const awtsmoosJSON = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { er } = require('../general.js');
const {
	closeAll,
	readPrateemBuffer
} = require('./directSeriesStore.js');
const { recoverSeriesPrateem } = require('./seriesPrateemRecovery.js');

/**
 * Parses an optional projection map without allowing malformed JSON to escape.
 * @param {*} value Projection request from the query string.
 * @returns {object|null} Parsed map or null.
 */
function parseMap(value) {
	if (!value) return null;
	if (typeof value === 'object') return { ...value };
	try {
		return JSON.parse(value);
	} catch (_error) {
		return null;
	}
}

/**
 * Keeps only explicitly requested metadata properties.
 * @param {object} value Healthy or recovered metadata.
 * @param {object|null} map Projection map.
 * @returns {object} Projected metadata.
 */
function project(value, map) {
	if (!map || !value) return value;
	const output = {};
	for (const [key, rule] of Object.entries(map)) {
		if (rule && Object.prototype.hasOwnProperty.call(value, key)) {
			output[key] = value[key];
		}
	}
	return output;
}

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
 * Returns the fast read-only series metadata contract used by the public route.
 * @param {object} context Request, Heichel identity, and series identity.
 * @returns {Promise<object>} Metadata envelope or bounded not-found error.
 */
async function getDirectSeriesPrateem({ $i, heichelId, seriesId }) {
	const buffer = readPrateemBuffer($i, heichelId, seriesId);
	const prateem = buffer ? decodePrateem(buffer, seriesId) : null;
	if (!prateem) {
		return er({
			code: 'SERIES_NOT_FOUND',
			details: { heichelId, seriesId }
		});
	}
	const map = parseMap($i.$_GET?.propertyMap || $i.$_GET?.properties);
	const selected = project(prateem, map);
	return {
		prateem: {
			...selected,
			id: selected.id || seriesId
		},
		id: seriesId
	};
}

module.exports = {
	closeAll,
	decodePrateem,
	getDirectSeriesPrateem,
	parseMap,
	project
};
