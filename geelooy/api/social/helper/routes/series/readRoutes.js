//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SeriesReadRoutes
 * @description
 * The Awtsmoos reveals series identity through bounded read vessels; on Awtsmoos.com,
 * healthy metadata stays whole while transfer placeholders yield only proven identity.
 *
 * B"H 2026-10-12 (api-hardening): every read is concrete now —
 *   * SERIES_NOT_FOUND leaves as HTTP 404 (never a silent 200),
 *   * wrong methods leave as HTTP 405,
 *   * unexpected failures leave as HTTP 500 without stack traces,
 *   * series details merge the legacy posts index with the packed allPosts
 *     shard, so posts live via /packed/read also appear on series pages,
 *   * child listings verify a non-root parent exists instead of answering []
 *     for a series that was never registered.
 */

const { getSeries, getSubSeries } = require('../../index.js');
const { getDirectSeriesPrateem } = require('../../series/directSeriesPrateem.js');
const { normalizeSeriesResult } = require('../../series/seriesPrateemRecovery.js');
const { readSubSeriesSummaries } = require('./subSeriesSummaries.js');
const { readMergedSeriesPosts } = require('./seriesPostMerge.js');
const {
	badRequest,
	methodNotAllowed,
	notFound,
	requireMethod,
	serverError
} = require('../apiHttp.js');

/** Returns true for the placeholder the recovery vessel leaves behind. */
function isPlaceholderOnly(prateem) {
	if (!prateem || typeof prateem !== 'object') return true;
	return Object.keys(prateem).filter(k => k !== 'id').length === 0;
}

/** Maps a series-domain error to its concrete HTTP envelope. */
function seriesError(error) {
	const code = error && typeof error === 'object' ? error.code : undefined;
	const details = error && typeof error === 'object' ? (error.details || error) : error;
	if (code === 'SERIES_NOT_FOUND' || code === 'PARENT_SERIES_NOT_FOUND') {
		return notFound(code, details);
	}
	if (code === 'METHOD_NOT_ALLOWED') return methodNotAllowed('GET');
	if (code) return serverError(code, error && error.message);
	return serverError('SERIES_READ_FAILED', error);
}

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

/** Creates the stable read-only series route table for one request. */
function createSeriesReadRoutes({ $i }) {
	return {
		'/heichelos/:heichel/series/': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			return readChildren($i, vars.heichel, 'root', true);
		},
		'/heichelos/:heichel/series/:series': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			if (!wantsDetails($i)) {
				return readSeriesPrateem($i, vars.heichel, vars.series);
			}
			return readSeriesDetails($i, vars.heichel, vars.series);
		},
		'/heichelos/:heichel/series/:series/details': async vars => {
			if ($i.request.method === 'GET') {
				return readSeriesDetails($i, vars.heichel, vars.series);
			}
			if ($i.request.method !== 'POST') return methodNotAllowed(['GET', 'POST']);
			const ids = seriesIds($i);
			if (!ids.length) return badRequest('MISSING_PARAMS', { seriesIds: 'non-empty array or comma list required' });
			const details = {};
			for (const id of ids) {
				details[id] = await readSeriesDetailsPlain($i, vars.heichel, id);
			}
			return { success: details };
		},
		'/heichelos/:heichel/series/:series/subSeriesDetails': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			return readChildren($i, vars.heichel, vars.series, true);
		},
		'/heichelos/:heichel/series/:series/subSeries': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			return readChildren($i, vars.heichel, vars.series, wantsDetails($i));
		},
		'/heichelos/:heichel/series/:series/subSeries/details': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			return readChildren($i, vars.heichel, vars.series, true);
		}
	};
}

module.exports = { createSeriesReadRoutes, readSeriesDetails, readSeriesDetailsPlain };
