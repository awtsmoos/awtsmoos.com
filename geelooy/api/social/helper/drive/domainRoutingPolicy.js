//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomainRoutingPolicy
 * @description
 * The Awtsmoos separates a name pointing at a server from permission to reveal a
 * site. Awtsmoos.com activates a Host only after ownership, delegation when needed,
 * and the already-bound public site all agree in one bounded testimony.
 */

const { siteMappingsFromState } = require('./siteMappingService.js');
const { domainError } = require('./domainHostnamePolicy.js');

const STATUS_BY_BLOCKER = Object.freeze({
	DOMAIN_NOT_FOUND: 404,
	SITE_NOT_FOUND: 404,
	SITE_DISABLED: 409,
	DOMAIN_OWNERSHIP_UNVERIFIED: 409,
	DOMAIN_DELEGATION_UNVERIFIED: 409
});

function routeActivationEligibility(state, record) {
	const blockers = [];
	if (!record) {
		blockers.push('DOMAIN_NOT_FOUND');
		return eligibilityResult(blockers, null);
	}
	if (record.ownershipState !== 'verified') {
		blockers.push('DOMAIN_OWNERSHIP_UNVERIFIED');
	}
	if (needsVerifiedDelegation(record)) {
		blockers.push('DOMAIN_DELEGATION_UNVERIFIED');
	}
	const site = siteMappingsFromState(state).find(candidate => {
		return candidate.id === record.siteId;
	});
	if (!site) {
		blockers.push('SITE_NOT_FOUND');
	} else if (!site.enabled) {
		blockers.push('SITE_DISABLED');
	}
	return eligibilityResult(blockers, record.siteId);
}

function assertRouteActivationEligible(state, record) {
	const eligibility = routeActivationEligibility(state, record);
	if (eligibility.eligible) {
		return eligibility;
	}
	const code = eligibility.blockers[0];
	const status = STATUS_BY_BLOCKER[code] || 409;
	throw domainError(code, status);
}

function needsVerifiedDelegation(record) {
	return record.mode === 'custom-nameservers'
		&& record.delegationState !== 'verified';
}

function eligibilityResult(blockers, siteId) {
	return {
		eligible: blockers.length === 0,
		blockers,
		siteId
	};
}

module.exports = {
	routeActivationEligibility,
	assertRouteActivationEligible
};
