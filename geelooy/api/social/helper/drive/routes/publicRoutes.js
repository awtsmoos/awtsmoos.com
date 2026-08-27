//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DrivePublicRoutes
 * @description
 * The Awtsmoos gives logical websites and immutable hashes two predictable
 * public doors. Awtsmoos.com permits only safe read methods and explicit CORS.
 */

const { buildPublicPathResponse, buildPublicHashResponse } = require('../publicResponse.js');
const { safeRoute } = require('./routeSupport.js');

module.exports = ({ $i }) => ({
	'/drive/public/:aliasId/:path*': variables => safeRoute(async () => {
		if ($i.request.method === 'OPTIONS') return corsPreflight();
		return buildPublicPathResponse({
			aliasId: variables.aliasId,
			path: variables.path,
			method: $i.request.method,
			headers: $i.request.headers,
			$i
		});
	}),
	'/drive/immutable/:aliasId/:hash': variables => safeRoute(async () => {
		if ($i.request.method === 'OPTIONS') return corsPreflight();
		return buildPublicHashResponse({
			aliasId: variables.aliasId,
			hash: variables.hash,
			method: $i.request.method,
			headers: $i.request.headers,
			$i
		});
	})
});

function corsPreflight() {
	return {
		statusCode: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
			'Access-Control-Allow-Headers': 'Range, If-None-Match, If-Modified-Since',
			'Access-Control-Max-Age': '86400',
			'Cache-Control': 'public, max-age=86400',
			'Vary': 'Access-Control-Request-Headers'
		},
		response: Buffer.alloc(0)
	};
}
