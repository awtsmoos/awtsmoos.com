//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainClaimAccess
 * @description
 * The Awtsmoos names the exact alias, site, and hostname before registry mutation may begin;
 * Awtsmoos.com keeps global collision, same-site replay, and missing-claim errors in one small guarded vessel.
 */

const { claimBelongsToSite } = require('./domainClaimRecord.js');
const { domainError, normalizeDomainHostname } = require('./domainPolicy.js');
const { normalizeSiteId } = require('./siteMappingPolicy.js');

function normalizeClaimIdentity(options) {
	return {
		siteId: normalizeSiteId(options.siteId),
		hostname: normalizeDomainHostname(options.hostname)
	};
}

function assertOwnedClaim(claim, aliasId, siteId) {
	if (!claimBelongsToSite(claim, aliasId, siteId)) {
		throw domainError('DOMAIN_CLAIM_NOT_FOUND', 'Domain claim not found.', 404);
	}
	return claim;
}

function assertReplayOrConflict(claim, options) {
	if (!claimBelongsToSite(claim, options.aliasId, options.siteId)) {
		throw domainError('DOMAIN_ALREADY_CLAIMED', 'This hostname is already claimed.', 409);
	}
	const sameMode = claim.dnsMode === options.dnsMode;
	const sameNameservers = JSON.stringify(claim.requestedNameservers || [])
		=== JSON.stringify(options.nameservers);
	if (!sameMode || !sameNameservers) {
		throw domainError(
			'DOMAIN_CLAIM_EXISTS',
			'Remove the existing claim before changing DNS mode.',
			409
		);
	}
	return claim;
}

module.exports = {
	assertOwnedClaim,
	assertReplayOrConflict,
	normalizeClaimIdentity
};
