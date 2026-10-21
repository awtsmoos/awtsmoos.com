//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module SeriesReadRoutesDetails
 * @description
 * Sibling of SeriesReadRoutes: series details and prateem reads, relocated verbatim.
 */

const { getSeries } = require('../../index.js');
const { getDirectSeriesPrateem } = require('../../series/directSeriesPrateem.js');
const { normalizeSeriesResult } = require('../../series/seriesPrateemRecovery.js');
const { readMergedSeriesPosts } = require('./seriesPostMerge.js');
const { badRequest, serverError } = require('../apiHttp.js');
const { seriesError } = require('./readRoutesError.js');

/**
 * Reads canonical details plus merged posts, returning plain data or a
 * plain {BH, error} body (the route applies the HTTP envelope).
 */
async function readSeriesDetailsPlain($i, heichelId, seriesId) {
	if (!heichelId || !seriesId) {
		return { BH: 'B"H', error: { code: 'MISSING_PARAMS', details: { heichelId, seriesId } } };
	}
	let result;
	try {
		result = await getSeries({ $i, heichelId, seriesId, withDetails: true });
	} catch (caught) {
		return { BH: 'B"H', error: { code: 'SERIES_READ_FAILED', message: String((caught && caught.message) || caught) } };
	}
	if (result && result.error) return result;
	let posts = result.posts;
	try {
		posts = await readMergedSeriesPosts({ $i, heichelId, seriesId, legacy: result.posts });
	} catch (caught) {
		// A packed-index failure must never empty a healthy legacy listing.
		if (typeof console !== 'undefined') console.error('B"H series post merge failed:', (caught && caught.message) || caught);
	}
	return normalizeSeriesResult({ ...result, posts }, seriesId);
}

/** Reads canonical details with the concrete HTTP envelope applied. */
async function readSeriesDetails($i, heichelId, seriesId) {
	const plain = await readSeriesDetailsPlain($i, heichelId, seriesId);
	if (plain && plain.error) {
		if (plain.error.code === 'MISSING_PARAMS') return badRequest('MISSING_PARAMS', plain.error.details);
		return seriesError(plain.error);
	}
	return plain;
}

/** Reads one series' fast metadata with legacy fallback inside the vessel. */
async function readSeriesPrateem($i, heichelId, seriesId) {
	if (!heichelId || !seriesId) return badRequest('MISSING_PARAMS', { heichelId, seriesId });
	let result;
	try {
		result = await getDirectSeriesPrateem({ $i, heichelId, seriesId });
	} catch (caught) {
		return serverError('SERIES_READ_FAILED', caught);
	}
	if (result && result.error) return seriesError(result.error);
	return result;
}

module.exports = {
	readSeriesDetailsPlain,
	readSeriesDetails,
	readSeriesPrateem
};
