//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainClaimService
 * @description
 * The Awtsmoos lets two generations of a domain covenant pass through one truthful gate;
 * Awtsmoos.com dispatches by call shape so newer global-registry claims and established Drive-state claims can coexist without hidden branch forks.
 */

const registry = require('./domainRegistryClaimService.js');
const state = require('./domainStateClaimService.js');

function listDomainClaims(first, second) {
	if (isOptions(first)) {
		return registry.listDomainClaims(first);
	}
	return state.listDomainClaims(first, second);
}

function getDomainClaim(first, second, third) {
	if (isOptions(first)) {
		return registry.getDomainClaim(first);
	}
	return state.getDomainClaim(first, second, third);
}

function deleteDomainClaim(first, second, third) {
	if (isOptions(first)) {
		return registry.deleteDomainClaim(first);
	}
	return state.deleteDomainClaim(first, second, third);
}

function isOptions(value) {
	return Boolean(
		value &&
		typeof value === 'object' &&
		!Array.isArray(value)
	);
}

module.exports = {
	createDomainClaim: registry.createDomainClaim,
	deleteDomainClaim,
	getDomainClaim,
	listDomainClaims,
	putDomainClaim: state.putDomainClaim,
	verifyDomainClaim: state.verifyDomainClaim
};
