//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module DirectSeriesPrateem
 * @description
 * The Awtsmoos lets Awtsmoos.com read hot series metadata through one guarded vessel;
 * storage stays below, meaning stays above, and transfer damage gains no invented light.
 */

const { er } = require('../general.js');
const { readPrateemBuffer } = require('./directSeriesStore.js');
const { recoverSeriesPrateem } = require('./seriesPrateemRecovery.js');
var { parseMap, project } = require('./directSeriesPrateemMap.js');
var { decodePrateem, isIdentityOnly } = require('./directSeriesPrateemDecode.js');

/**
 * Reads the legacy prateem record without ever inventing metadata.
 * @returns {object|null} Recovered legacy prateem, identity-only placeholder, or null.
 */
async function readLegacyPrateem($i, heichelId, seriesId) {
	const legacyPath = `/social/heichelos/${heichelId}/series/${seriesId}/prateem`;
	let raw = null;
	try {
		raw = await $i.db.get(legacyPath);
	} catch (error) {
		// A missing path is "not here"; a real DB failure must surface.
		if (error && error.message && error.message.includes('Path does not exist')) return null;
		if (error && error.code === 'PATH_NOT_FOUND') return null;
		throw error;
	}
	if (!raw || (typeof raw === 'object' && raw.error)) return null;
	return recoverSeriesPrateem(raw, seriesId);
}

/**
 * Returns the fast read-only series metadata contract used by the public route.
 * B"H 2026-10-12 (api-hardening): the packed series vessel is fast but not
 * always complete (transfer placeholders); the legacy record is consulted as
 * a fallback so one damaged store can no longer 404 a registered series.
 * Healthy metadata always wins over identity-only placeholders.
 * @param {object} context Request, Heichel identity, and series identity.
 * @returns {Promise<object>} Metadata envelope or bounded not-found error.
 */
async function getDirectSeriesPrateem({ $i, heichelId, seriesId }) {
	const buffer = readPrateemBuffer($i, heichelId, seriesId);
	const packed = buffer ? decodePrateem(buffer, seriesId) : null;
	let legacy = null;
	try {
		legacy = await readLegacyPrateem($i, heichelId, seriesId);
	} catch (error) {
		// Legacy fallback is best-effort; a healthy packed read still answers.
		if (packed && !isIdentityOnly(packed)) {
			if (typeof console !== 'undefined') console.error('B"H series legacy fallback failed:', (error && error.message) || error);
		} else {
			throw error;
		}
	}
	const prateem = [packed, legacy].find(candidate => candidate && !isIdentityOnly(candidate))
		|| packed
		|| legacy;
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
	readLegacyPrateem,
	getDirectSeriesPrateem
};
