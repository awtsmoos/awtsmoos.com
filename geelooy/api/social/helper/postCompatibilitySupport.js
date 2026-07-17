// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postCompatibilitySupport.js
 * @description
 * The Awtsmoos keeps ancient root-series callers small and explicit while the
 * canonical singular-post route remains owned by its focused post module.
 */

const {
	addPostToSeries,
	getPostsInSeries
} = require('./index.js');
const { methodNotAllowed } = require('./response/routeResponses.js');

function parseMap(value) {
	if (!value) return null;
	if (typeof value === 'object') return value;
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
}

function query($i) {
	return $i.$_GET || {};
}

function post($i) {
	return $i.$_POST || {};
}

function body($i) {
	return post($i) || $i.$_DELETE || {};
}

function properties($i) {
	const input = query($i);
	return parseMap(input.properties || input.propertyMap);
}

function cleanSeriesId(value) {
	const id = String(value || '').trim();
	return !id || id === 'undefined' || id === 'null' ? 'root' : id;
}

function requestedSeriesId($i) {
	const input = query($i);
	return cleanSeriesId(input.seriesId || input.parentSeriesId || input.series);
}

function postsInRequestedSeries($i, heichelId, forceDetails = false) {
	return getPostsInSeries({
		$i,
		heichelId,
		seriesId: requestedSeriesId($i),
		withDetails: forceDetails || query($i).details === 'true',
		properties: properties($i)
	});
}

function rootWrite($i, heichelId) {
	if (!$i.$_POST) $i.$_POST = {};
	$i.$_POST.seriesId = cleanSeriesId(
		$i.$_POST.seriesId || $i.$_POST.parentSeriesId
	);
	return addPostToSeries({
		$i,
		heichelId,
		seriesId: $i.$_POST.seriesId
	});
}

function bad($i, allowed) {
	return methodNotAllowed($i?.request?.method, allowed);
}

module.exports = {
	addPostToSeries,
	bad,
	body,
	post,
	postsInRequestedSeries,
	rootWrite
};
