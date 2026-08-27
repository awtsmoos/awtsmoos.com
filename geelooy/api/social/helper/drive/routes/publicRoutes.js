//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DrivePublicRoutes
 * @description
 * The Awtsmoos gives logical Drive bytes and canonical Sites their proper doors.
 * Awtsmoos.com honors the legacy nginx road while marked `/sites` traffic flows
 * into the newer mapping gateway; ordinary Drive URLs retain their ancient law.
 */

const { buildPublicPathResponse, buildPublicHashResponse } = require('../publicResponse.js');
const { buildMarkedSiteResponse } = require('../publicSiteCompatibility.js');
const { safeRoute } = require('./routeSupport.js');

module.exports = ({ $i }) => ({
	'/drive/public/:aliasId/:path*': variables => safeRoute(async () => {
		const request = publicRequest($i, variables);
		const siteResponse = await buildMarkedSiteResponse(request);
		if (siteResponse) return siteResponse;
		if (request.method === 'OPTIONS') return corsPreflight();
		return buildPublicPathResponse(request);
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

function publicRequest($i, variables) {
	return {
		aliasId: variables.aliasId,
		path: variables.path,
		method: String($i.request.method || 'GET').toUpperCase(),
		headers: $i.request.headers || {},
		requestUrl: $i.request.url || '/',
		$i
	};
}

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
