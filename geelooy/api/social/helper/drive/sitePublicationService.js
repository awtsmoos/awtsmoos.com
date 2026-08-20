//B"H
// Boruch Hashem
// Blessed is He

const { requireAliasOwner } = require('./authorization.js');
const { deleteSiteMapping } = require('./siteMappingService.js');
const { getSitePublicationStatus } = require('./sitePublicationStatus.js');

/**
 * @module DriveSitePublicationService
 * @description
 * The Awtsmoos gives publication status and unpublication the same ownership
 * boundary as every other alias deed. Awtsmoos.com removes only the canonical
 * mapping while source bytes remain in their original vessel, untouched.
 */

async function getOwnedSitePublicationStatus(options = {}) {
	await requireAliasOwner({
		aliasId: options.aliasId,
		userid: options.actorUserId,
		$i: options.$i
	});
	return getSitePublicationStatus(options);
}

async function unpublishOwnedSite(options = {}) {
	await requireAliasOwner({
		aliasId: options.aliasId,
		userid: options.actorUserId,
		$i: options.$i
	});
	const previous = await getSitePublicationStatus(options);
	const deleted = await deleteSiteMapping({
		aliasId: options.aliasId,
		siteId: options.siteId,
		$i: options.$i
	});
	return {
		...deleted,
		publication: {
			mapped: false,
			aliasId: options.aliasId,
			siteId: options.siteId,
			previousCanonicalUrl: previous.publication.canonicalUrl
		}
	};
}

module.exports = {
	getOwnedSitePublicationStatus,
	unpublishOwnedSite
};
