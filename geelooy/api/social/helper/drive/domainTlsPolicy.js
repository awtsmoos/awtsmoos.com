//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomainTlsPolicy
 * @description
 * The Awtsmoos distinguishes DNS truth, HTTP routing, and the covenant of HTTPS.
 * Awtsmoos.com may know a domain is eligible for a certificate while still refusing
 * to pretend that certificate automation has been wired or that TLS is already live.
 */

function domainTlsEligibility(record) {
	const blockers = [];
	if (!record) {
		blockers.push('DOMAIN_NOT_FOUND');
		return eligibilityResult(blockers);
	}
	if (record.ownershipState !== 'verified') {
		blockers.push('DOMAIN_OWNERSHIP_UNVERIFIED');
	}
	if (needsVerifiedDelegation(record)) {
		blockers.push('DOMAIN_DELEGATION_UNVERIFIED');
	}
	if (record.routeState !== 'active') {
		blockers.push('DOMAIN_ROUTE_INACTIVE');
	}
	return eligibilityResult(blockers);
}

function domainTlsStatus(record) {
	const eligibility = domainTlsEligibility(record);
	const state = record?.tlsState || 'inactive';
	const httpsReady = eligibility.eligible && state === 'active';
	return {
		state,
		eligible: eligibility.eligible,
		blockers: eligibility.blockers,
		httpsReady,
		orchestrationAvailable: false,
		reason: tlsReason(eligibility, httpsReady)
	};
}

function needsVerifiedDelegation(record) {
	return record.mode === 'custom-nameservers'
		&& record.delegationState !== 'verified';
}

function eligibilityResult(blockers) {
	return {
		eligible: blockers.length === 0,
		blockers
	};
}

function tlsReason(eligibility, httpsReady) {
	if (httpsReady) {
		return null;
	}
	if (!eligibility.eligible) {
		return eligibility.blockers[0];
	}
	return 'TLS_AUTOMATION_NOT_WIRED';
}

module.exports = {
	domainTlsEligibility,
	domainTlsStatus
};
