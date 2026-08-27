//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosSiteGatewayResponses
 * @description
 * The Awtsmoos keeps public response mechanics in their own vessel so the gateway may remain a clear path of resolution;
 * Awtsmoos.com preserves ranges, MIME, mapped 404s, redirects, and site identity headers without crowding route orchestration.
 */

const { buildPublicPathResponse } = require('../api/social/helper/drive/publicResponse.js');
const { notFoundResponse } = require('../api/social/helper/drive/publicResponseHeaders.js');

async function publicSiteResponse(options, path, method) {
	return buildPublicPathResponse({
		aliasId: options.aliasId,
		path,
		method,
		headers: options.headers || {},
		$i: options.$i
	});
}

async function mappedNotFound(options, method, original, fallbackPath) {
	const fallback = await publicSiteResponse(options, fallbackPath, method);
	if (fallback.statusCode !== 200) {
		return original;
	}
	return {
		...fallback,
		statusCode: 404,
		headers: {
			...fallback.headers,
			'Cache-Control': 'no-cache, must-revalidate'
		}
	};
}

function redirectSiteResponse(value) {
	const url = new URL(String(value || '/'), 'https://awtsmoos.com');
	url.pathname = `${url.pathname}/`;
	return {
		statusCode: 308,
		headers: {
			Location: `${url.pathname}${url.search}`,
			'Cache-Control': 'no-store'
		},
		response: Buffer.alloc(0)
	};
}

function withSiteHeaders(result, aliasId, resolution = null) {
	const headers = {
		...(result.headers || {}),
		'X-Awtsmoos-Site-Alias': String(aliasId || '')
	};
	if (resolution?.named && !resolution.blocked) {
		headers['X-Awtsmoos-Site-Id'] = resolution.mapping.id;
	}
	return {
		...result,
		headers
	};
}

function blockedSiteResponse(aliasId) {
	return withSiteHeaders(notFoundResponse(), aliasId);
}

function methodSiteResponse() {
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
	blockedSiteResponse,
	mappedNotFound,
	methodSiteResponse,
	publicSiteResponse,
	redirectSiteResponse,
	withSiteHeaders
};
