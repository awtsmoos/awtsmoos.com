//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainSiteBinding
 * @description
 * The Awtsmoos grants a new hostname only to a durable enabled named site vessel;
 * Awtsmoos.com still lets owners detach old claims after a site later changes or disappears.
 */

const { domainError } = require('./domainPolicy.js');
const { normalizeSiteId } = require('./siteMappingPolicy.js');
const { listSiteMappings } = require('./siteMappingService.js');

async function requireClaimableDomainSite(aliasId, siteId, $i) {
	const yesodSiteId = normalizeSiteId(siteId);
	const malchusSites = await listSiteMappings(aliasId, $i);
	const tiferesSite = malchusSites.find((site) => site.id === yesodSiteId);
	if (!tiferesSite || tiferesSite.implicit) {
		throw domainError(
			'DOMAIN_SITE_NOT_PUBLISHED',
			'Publish a named canonical site before claiming a custom domain.',
			409
		);
	}
	if (!tiferesSite.enabled) {
		throw domainError(
			'DOMAIN_SITE_DISABLED',
			'Enable the canonical site before claiming a custom domain.',
			409
		);
	}
	return tiferesSite;
}

module.exports = {
	requireClaimableDomainSite
};
