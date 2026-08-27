//B"H
// Boruch Hashem
// Blessed is He

const { buildSiteResponse } = require('../../../../sites/siteGateway.js');

/**
 * @module PublicSiteCompatibility
 * @description
 * The Awtsmoos lets an older edge road meet the newer canonical garden without
 * confusing public routing with authority. Awtsmoos.com reads the nginx site
 * marker only as a vessel-selection signal; unmarked Drive roads remain Drive.
 */

const SITE_ALIAS_HEADER = 'x-awtsmoos-site-alias';

/**
 * Route nginx-marked canonical site traffic into the Sites gateway.
 *
 * @param {object} options Public route inputs.
 * @param {Function} siteBuilder Injectable Sites response builder.
 * @returns {Promise<object|null>} Sites response, or null for ordinary Drive.
 */
async function buildMarkedSiteResponse(options = {}, siteBuilder = buildSiteResponse) {
	if (!isMarkedSiteRequest(options.aliasId, options.headers)) return null;
	return siteBuilder({
		aliasId: options.aliasId,
		path: options.path,
		method: options.method,
		headers: options.headers,
		url: canonicalSiteRequestUrl(options),
		$i: options.$i
	});
}

/** Reveal whether nginx identified this request as canonical Sites traffic. */
function isMarkedSiteRequest(aliasId, headers = {}) {
	const marker = headerValue(headers, SITE_ALIAS_HEADER);
	return Boolean(marker && marker === String(aliasId || ''));
}

/** Rebuild the public URL shape hidden by nginx's legacy internal rewrite. */
function canonicalSiteRequestUrl(options = {}) {
	const aliasId = encodeURIComponent(String(options.aliasId || ''));
	const segments = String(options.path || '')
		.split('/')
		.filter(Boolean)
		.map(encodeURIComponent);
	let url = `/sites/${aliasId}/`;
	if (segments.length) url += segments.join('/');
	if (requestHasTrailingSlash(options.requestUrl) && !url.endsWith('/')) url += '/';
	return url;
}

function headerValue(headers, name) {
	const direct = headers?.[name] ?? headers?.[name.toLowerCase()];
	if (direct !== undefined) return String(Array.isArray(direct) ? direct[0] : direct);
	const match = Object.keys(headers || {}).find(key => key.toLowerCase() === name);
	return match ? String(headers[match]) : '';
}

function requestHasTrailingSlash(url) {
	return String(url || '').split('?')[0].split('#')[0].endsWith('/');
}

module.exports = {
	SITE_ALIAS_HEADER,
	buildMarkedSiteResponse,
	canonicalSiteRequestUrl,
	isMarkedSiteRequest
};
