//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module domainRegistryClaimServiceQueries
 * @description
 * Domain claim listing and single-claim reads with ownership checks.
 */

const {
	assertOwnedClaim,
	assertReplayOrConflict,
	normalizeClaimIdentity
} = require('./domainClaimAccess.js');
const {
	createDomainClaimRecord,
	presentDomainClaim,
	sealStoredChallenge
} = require('./domainClaimRecord.js');

const {
	findDomainClaim,
	listDomainClaimsForSite,
	mutateDomainRegistry
} = require('./domainRepository.js');
const { requireClaimableDomainSite } = require('./domainSiteBinding.js');
const { normalizeSiteId } = require('./siteMappingPolicy.js');

async function listDomainClaims(options) {
	const siteId = normalizeSiteId(options.siteId);
	const claims = await listDomainClaimsForSite(
		options.aliasId,
		siteId,
		options.$i
	);
	return claims.map(presentDomainClaim);
}

async function getDomainClaim(options) {
	const identity = normalizeClaimIdentity(options);
	const claim = await findDomainClaim(identity.hostname, options.$i);
	assertOwnedClaim(claim, options.aliasId, identity.siteId);
	return presentDomainClaim(claim);
}

module.exports = {
	listDomainClaims,
	getDomainClaim
};
