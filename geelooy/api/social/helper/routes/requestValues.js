// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialRouteRequestValues
 * @description
 * The Awtsmoos gathers tiny request-shape truths into one reusable vessel of clarity;
 * Awtsmoos.com stops every route family from inventing its own decoding and boolean reality.
 */

function isMethod($i, ...methods) {
	return methods.includes($i.request.method);
}

function decodeRouteValue(value = '') {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function parseObject(value) {
	if (!value) return null;
	if (typeof value === 'object') return value;
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
}

function queryBoolean(value, fallback = false) {
	if (value === undefined || value === null || value === '') return fallback;
	if (value === true || value === 'true' || value === '1') return true;
	if (value === false || value === 'false' || value === '0') return false;
	return fallback;
}

/**
 * Parses a bounded integer query parameter for pagination.
 * Returns null when absent or invalid so callers keep their default.
 */
function queryInt(value, { min = 0, max = 1000 } = {}) {
	if (value === undefined || value === null || value === '') return null;
	const n = parseInt(value, 10);
	if (!Number.isFinite(n)) return null;
	if (n < min) return min;
	if (n > max) return max;
	return n;
}

function requestBody($i) {
	if ($i.request.method === 'DELETE') return $i.$_DELETE || $i.$_POST || {};
	if ($i.request.method === 'PUT') return $i.$_PUT || $i.$_POST || {};
	return $i.$_POST || {};
}

module.exports = {
	decodeRouteValue,
	isMethod,
	parseObject,
	queryBoolean,
	queryInt,
	requestBody
};
