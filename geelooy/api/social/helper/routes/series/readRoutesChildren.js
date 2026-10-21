//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module SeriesReadRoutesChildren
 * @description
 * Sibling of SeriesReadRoutes: parent check, child listing and query helpers, relocated verbatim.
 */

const { getSubSeries } = require('../../index.js');
const { getDirectSeriesPrateem } = require('../../series/directSeriesPrateem.js');
const { readSubSeriesSummaries } = require('./subSeriesSummaries.js');
const { notFound, serverError } = require('../apiHttp.js');
const { isPlaceholderOnly } = require('./readRoutesError.js');

/**
 * Verifies a non-root parent is registered before listing its children;
 * an unregistered parent is a 404, never a silent empty page.
 */
async function ensureParentRegistered($i, heichelId, parentSeriesId) {
	if (!parentSeriesId || parentSeriesId === 'root') return null;
	let parent;
	try {
		parent = await getDirectSeriesPrateem({ $i, heichelId, seriesId: parentSeriesId });
	} catch (caught) {
		return serverError('SERIES_READ_FAILED', caught);
	}
	if (parent && parent.error) return notFound('SERIES_NOT_FOUND', { heichelId, seriesId: parentSeriesId });
	if (parent && isPlaceholderOnly(parent.prateem)) {
		// A bare placeholder still proves registration; children may exist.
		return null;
	}
	return null;
}

/** Reads render-ready children only when the caller explicitly requests details. */
async function readChildren($i, heichelId, parentSeriesId, detailed) {
	const missing = await ensureParentRegistered($i, heichelId, parentSeriesId);
	if (missing) return missing;
	try {
		if (detailed) {
			return await readSubSeriesSummaries({ $i, heichelId, parentSeriesId });
		}
		return await getSubSeries({ $i, heichelId, parentSeriesId, withDetails: false });
	} catch (caught) {
		return serverError('SERIES_READ_FAILED', caught);
	}
}

/** Normalizes a details query value into one strict Boolean decision. */
function wantsDetails($i) {
	return $i.$_GET?.details === true || $i.$_GET?.details === 'true';
}

/** Normalizes POSTed bulk series identities without accepting empty values. */
function seriesIds($i) {
	const value = $i.$_POST?.seriesIds;
	if (Array.isArray(value)) return value.filter(Boolean);
	return String(value || '')
		.split(',')
		.map(id => id.trim())
		.filter(Boolean);
}

module.exports = {
	ensureParentRegistered,
	readChildren,
	wantsDetails,
	seriesIds
};
