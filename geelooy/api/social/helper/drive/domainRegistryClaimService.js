//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomainRegistryClaimService
 * @description
 * The Awtsmoos lets one named site receive one globally guarded hostname claim;
 * Awtsmoos.com keeps collision private, replay secret-free, and the raw DNS challenge a one-time revelation rather than durable registry cargo.
 */

const {
	createDomainChallenge,
	domainChallengeInstruction,
	hashDomainChallenge
} = require('./domainChallenge.js');
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
	normalizeDnsMode,
	normalizeDomainHostname,
	normalizeNameservers
} = require('./domainPolicy.js');
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

async function createDomainClaim(options) {
	const site = await requireClaimableDomainSite(
		options.aliasId,
		options.siteId,
		options.$i
	);
	const hostname = normalizeDomainHostname(options.input?.hostname);
	const dnsMode = normalizeDnsMode(options.input?.dnsMode);
	const nameservers = normalizeNameservers(options.input?.nameservers, dnsMode);
	const creation = await mutateDomainRegistry(options.$i, claims => {
		const existing = claims[hostname];
		if (existing) {
			assertReplayOrConflict(existing, {
				aliasId: options.aliasId,
				siteId: site.id,
				dnsMode,
				nameservers
			});
			sealStoredChallenge(existing);
			return { claim: existing, token: null };
		}
		const token = createDomainChallenge();
		const claim = createDomainClaimRecord({
			hostname,
			aliasId: options.aliasId,
			siteId: site.id,
			dnsMode,
			requestedNameservers: nameservers,
			challengeHash: hashDomainChallenge(token),
			now: options.now
		});
		claims[hostname] = claim;
		return { claim, token };
	});
	return presentCreation(creation);
}

async function deleteDomainClaim(options) {
	const identity = normalizeClaimIdentity(options);
	return mutateDomainRegistry(options.$i, claims => {
		assertOwnedClaim(
			claims[identity.hostname],
			options.aliasId,
			identity.siteId
		);
		delete claims[identity.hostname];
		return { deleted: true, hostname: identity.hostname };
	});
}

function presentCreation(creation) {
	const presented = presentDomainClaim(creation.claim);
	if (!creation.token) return presented;
	return {
		...presented,
		ownershipInstruction: domainChallengeInstruction(
			creation.claim.hostname,
			creation.token
		)
	};
}

module.exports = {
	createDomainClaim,
	deleteDomainClaim,
	getDomainClaim,
	listDomainClaims
};
