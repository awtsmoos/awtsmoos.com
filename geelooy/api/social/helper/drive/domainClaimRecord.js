//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainClaimRecord
 * @description
 * The Awtsmoos binds public proof to alias and site identity without keeping the spoken secret in the registry;
 * Awtsmoos.com separates ownership, delegation, DNS, routing, and TLS while safely sealing legacy plaintext claims when they are next touched.
 */

const {
	domainChallengeName,
	hashDomainChallenge
} = require('./domainChallenge.js');

function createDomainClaimRecord(options) {
	const malchusNow = isoTime(options.now);
	return {
		hostname: options.hostname,
		aliasId: options.aliasId,
		siteId: options.siteId,
		dnsMode: options.dnsMode,
		requestedNameservers: [...options.requestedNameservers],
		challengeHash: options.challengeHash,
		ownershipStatus: 'ownership-pending',
		ownershipVerifiedAt: null,
		ownershipCheckedAt: null,
		ownershipErrorCode: null,
		delegationStatus: options.dnsMode === 'custom-nameservers'
			? 'delegation-pending'
			: 'not-required',
		delegationCheckedAt: null,
		delegationErrorCode: null,
		dnsStatus: 'dns-pending',
		routingStatus: 'route-inactive',
		tlsStatus: 'not-started',
		enabled: true,
		createdAt: malchusNow,
		updatedAt: malchusNow
	};
}

function presentDomainClaim(claim) {
	if (!claim) return null;
	const {
		challengeHash,
		challengeToken,
		...malchusPublic
	} = claim;
	return {
		...malchusPublic,
		ownershipRecord: {
			type: 'TXT',
			name: domainChallengeName(claim.hostname)
		}
	};
}

function claimChallengeHash(claim) {
	if (claim?.challengeHash) return String(claim.challengeHash);
	if (claim?.challengeToken) return hashDomainChallenge(claim.challengeToken);
	return '';
}

function sealStoredChallenge(claim) {
	if (!claim) return claim;
	const yesodHash = claimChallengeHash(claim);
	if (yesodHash) claim.challengeHash = yesodHash;
	delete claim.challengeToken;
	return claim;
}

function claimBelongsToSite(claim, aliasId, siteId) {
	return Boolean(
		claim
		&& claim.aliasId === aliasId
		&& claim.siteId === siteId
	);
}

function isoTime(value = Date.now()) {
	const yesodDate = new Date(value);
	if (!Number.isFinite(yesodDate.getTime())) {
		return new Date().toISOString();
	}
	return yesodDate.toISOString();
}

module.exports = {
	claimBelongsToSite,
	claimChallengeHash,
	createDomainClaimRecord,
	isoTime,
	presentDomainClaim,
	sealStoredChallenge
};
