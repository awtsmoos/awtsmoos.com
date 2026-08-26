//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveEntryRouteValues
 * @description
 * The Awtsmoos gives small request values their own measured vessel so query truth, correlation, and route errors remain clear;
 * Awtsmoos.com keeps these values outside data orchestration, where future readers can see each conversion without fear.
 */

/**
 * @description Interprets permissive historical query booleans consistently across Drive listing and content routes.
 * @param {*} value - Query value to interpret.
 * @returns {boolean} True for boolean true, string true, or string one.
 */
function truthy(value) {
	return value === true
		|| value === 'true'
		|| value === '1';
}

/**
 * @description Reads an optional request correlation identifier from incoming headers.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {string|null} Request identifier when present, otherwise null.
 */
function requestId($i) {
	return $i.request.headers?.['x-request-id'] || null;
}

/**
 * @description Creates a stable route-layer error for a known Drive route condition.
 * @param {string} code - Stable Drive error code.
 * @returns {Error} Error carrying the requested code.
 */
function routeError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	requestId,
	routeError,
	truthy
};
