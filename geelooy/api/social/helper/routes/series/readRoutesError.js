//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module SeriesReadRoutesError
 * @description
 * Sibling of SeriesReadRoutes: placeholder check and error mapping, relocated verbatim.
 */

const { notFound, methodNotAllowed, serverError } = require('../apiHttp.js');

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

module.exports = {
	isPlaceholderOnly,
	seriesError
};
