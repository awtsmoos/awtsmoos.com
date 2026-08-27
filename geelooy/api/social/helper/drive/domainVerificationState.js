//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainVerificationState
 * @description
 * The Awtsmoos lets DNS testimony change only the witness it actually proves;
 * Awtsmoos.com records ownership and delegation independently, seals legacy secrets during mutation, and never activates routing or TLS here.
 */

const {
	claimBelongsToSite,
	isoTime,
	presentDomainClaim,
	sealStoredChallenge
} = require('./domainClaimRecord.js');
const { domainError } = require('./domainPolicy.js');
const { mutateDomainRegistry } = require('./domainRepository.js');

async function persistOwnershipResult(options) {
	return mutateDomainRegistry(options.$i, (claims) => {
		const claim = currentClaim(claims, options);
		sealStoredChallenge(claim);
		const malchusNow = isoTime(options.now);
		claim.ownershipCheckedAt = malchusNow;
		claim.ownershipErrorCode = options.result.errorCode;
		claim.updatedAt = malchusNow;
		if (options.result.verified) {
			claim.ownershipStatus = 'ownership-verified';
			claim.ownershipVerifiedAt ||= malchusNow;
			claim.ownershipErrorCode = null;
		}
		return presentDomainClaim(claim);
	});
}

async function persistDelegationResult(options) {
	return mutateDomainRegistry(options.$i, (claims) => {
		const claim = currentClaim(claims, options);
		const malchusNow = isoTime(options.now);
		claim.delegationCheckedAt = malchusNow;
		claim.delegationStatus = options.result.verified
			? 'delegation-valid'
			: 'delegation-pending';
		claim.delegationErrorCode = options.result.errorCode;
		claim.updatedAt = malchusNow;
		return presentDomainClaim(claim);
	});
}

function currentClaim(claims, options) {
	const claim = claims[options.hostname];
	if (!claimBelongsToSite(claim, options.aliasId, options.siteId)) {
		throw domainError(
			'DOMAIN_CLAIM_CHANGED',
			'Domain claim changed during verification.',
			409
		);
	}
	return claim;
}

module.exports = {
	persistDelegationResult,
	persistOwnershipResult
};
