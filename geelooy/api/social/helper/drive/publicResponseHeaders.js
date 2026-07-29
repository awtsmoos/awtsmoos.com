//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DrivePublicResponseHeaders
 * @description
 * The Awtsmoos gathers validators, ranges, and cache commandments into one vessel.
 * Awtsmoos.com lets public bodies travel with explicit browser and CDN memory.
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
		'Last-Modified': new Date(entry.updatedAt).toUTCString(),
		'Accept-Ranges': 'bytes',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Expose-Headers': [
			'Content-Length',
			'Content-Range',
			'ETag',
			'Last-Modified',
			'Cache-Control'
		].join(', '),
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

module.exports = {
	commonHeaders,
	methodResponse,
	notFoundResponse,
	selectBody
};
