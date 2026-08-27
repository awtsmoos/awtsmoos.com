//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DrivePublicResponseHeaders
 * @description
 * The Awtsmoos gathers validators, ranges, and cache commandments into one
 * vessel. Awtsmoos.com speaks Last-Modified only when time is actually known,
 * while content hashes remain the exact witness of byte identity.
 */

const {
	cacheControlFor,
	sharedCacheHeadersFor
} = require('./cachePolicy.js');
const { parseByteRange } = require('./httpConditions.js');

function commonHeaders(entry, etag) {
	return {
		'Content-Type': entry.mime,
		'Cache-Control': cacheControlFor(entry),
		...sharedCacheHeadersFor(entry),
		'ETag': etag,
		...lastModifiedHeader(entry.updatedAt),
		'Accept-Ranges': 'bytes',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Expose-Headers': exposedHeaders(entry.updatedAt),
		'X-Content-Type-Options': 'nosniff',
		'Vary': 'Accept-Encoding'
	};
}

function selectBody(fullBody, requestHeaders, responseHeaders) {
	const range = parseByteRange(requestHeaders, fullBody.length);
	if (!range) return { body: fullBody, statusCode: 200 };
	responseHeaders['Content-Range'] = `bytes ${range.start}-${range.end}/${fullBody.length}`;
	return {
		body: fullBody.subarray(range.start, range.end + 1),
		statusCode: 206
	};
}

function notFoundResponse() {
	return {
		statusCode: 404,
		headers: {
			'Cache-Control': 'no-store',
			'Content-Type': 'text/plain; charset=utf-8'
		},
		response: 'Not Found'
	};
}

function methodResponse() {
	return {
		statusCode: 405,
		headers: {
			Allow: 'GET, HEAD',
			'Cache-Control': 'no-store'
		},
		response: 'Method Not Allowed'
	};
}

function lastModifiedHeader(updatedAt) {
	const date = validDate(updatedAt);
	return date ? { 'Last-Modified': date.toUTCString() } : {};
}

function exposedHeaders(updatedAt) {
	const names = ['Content-Length', 'Content-Range', 'ETag', 'Cache-Control'];
	if (validDate(updatedAt)) names.splice(3, 0, 'Last-Modified');
	return names.join(', ');
}

function validDate(value) {
	if (value === undefined || value === null || value === '') return null;
	const date = new Date(value);
	return Number.isFinite(date.getTime()) ? date : null;
}

module.exports = {
	commonHeaders,
	methodResponse,
	notFoundResponse,
	selectBody
};
