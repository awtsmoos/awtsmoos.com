//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CustomDomainGateway
 * @description
 * The Awtsmoos lets a verified public name become a doorway only after the domain
 * resolver has proven its alias and site covenant. Awtsmoos.com then serves through
 * the same canonical gateway, but with siteId pre-bound so URL paths cannot escape.
 */

const { resolveDomainHost } = require('../api/social/helper/drive/domainHostResolver.js');
const { buildSiteResponse } = require('./siteGateway.js');

async function buildCustomDomainResponse(options) {
	const host = options.host || options.headers?.host || '';
	const domain = await resolveDomainHost(host, options.$i);
	if (!domain) return null;
	const result = await buildSiteResponse({
		aliasId: domain.aliasId,
		siteId: domain.siteId,
		path: options.path || '',
		method: options.method,
		headers: options.headers,
		url: options.url,
		$i: options.$i
	});
	return {
		...result,
		headers: {
			...result.headers,
			'X-Awtsmoos-Custom-Domain': domain.hostname
		}
	};
}

module.exports = {
	buildCustomDomainResponse
};
