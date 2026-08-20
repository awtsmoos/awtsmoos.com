//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CustomDomainGateway
 * @description
 * The Awtsmoos lets a verified public name become a doorway only after the domain resolver proves its alias and Site covenant;
 * Awtsmoos.com then carries the same request, cookies, body, and trusted runtime motion through the canonical gateway without inventing a second hosting law nearby.
 */

const { resolveDomainHost } = require('../api/social/helper/drive/domainHostResolver.js');
const { buildSiteResponse } = require('./siteGateway.js');

async function buildCustomDomainResponse(options) {
	const host = options.host || options.headers?.host || '';
	const domain = await resolveDomainHost(host, options.$i);
	if (!domain) {
		return null;
	}
	const result = await buildSiteResponse({
		aliasId: domain.aliasId,
		siteId: domain.siteId,
		path: options.path || '',
		method: options.method,
		headers: options.headers,
		request: options.request,
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
