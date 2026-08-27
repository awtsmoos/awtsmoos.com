//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainVerificationService
 * @description
 * The Awtsmoos lets DNS testify without ever restoring the one-time secret to durable storage;
 * Awtsmoos.com reads exact claim proof, asks public DNS, then delegates each independent state transition to one atomic registry witness.
 */

const { assertOwnedClaim, normalizeClaimIdentity } = require('./domainClaimAccess.js');
const { claimChallengeHash } = require('./domainClaimRecord.js');
const { domainError } = require('./domainPolicy.js');
const { findDomainClaim } = require('./domainRepository.js');
const {
	verifyDomainTxt,
	verifyNameserverDelegation
} = require('./domainVerification.js');
const {
	persistDelegationResult,
	persistOwnershipResult
} = require('./domainVerificationState.js');

async function verifyDomainOwnership(options) {
	const identity = normalizeClaimIdentity(options);
	const claim = await ownedClaim(options, identity);
	const challengeHash = claimChallengeHash(claim);
	if (!challengeHash) {
		throw domainError(
			'DOMAIN_CHALLENGE_MISSING',
			'Domain claim has no ownership challenge proof.',
			409
		);
	}
	const result = await verifyDomainTxt({
		hostname: identity.hostname,
		challengeHash,
		resolveTxt: options.resolveTxt
	});
	return persistOwnershipResult({
		...options,
		...identity,
		result
	});
}

async function verifyDomainDelegation(options) {
	const identity = normalizeClaimIdentity(options);
	const claim = await ownedClaim(options, identity);
	if (claim.dnsMode !== 'custom-nameservers') {
		throw domainError(
			'DOMAIN_DELEGATION_NOT_REQUIRED',
			'This claim does not use custom nameservers.',
			409
		);
	}
	const result = await verifyNameserverDelegation({
		hostname: identity.hostname,
		requestedNameservers: claim.requestedNameservers,
		resolveNs: options.resolveNs
	});
	return persistDelegationResult({
		...options,
		...identity,
		result
	});
}

async function ownedClaim(options, identity) {
	const claim = await findDomainClaim(identity.hostname, options.$i);
	return assertOwnedClaim(claim, options.aliasId, identity.siteId);
}

module.exports = {
	verifyDomainDelegation,
	verifyDomainOwnership
};
