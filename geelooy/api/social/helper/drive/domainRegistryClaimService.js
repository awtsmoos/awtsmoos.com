//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module domainRegistryClaimService
 * @description
 * Barrel for domainRegistryClaimService: re-exports the identical surface from its sibling modules.
 */

const { createDomainClaim, deleteDomainClaim } = require('./domainRegistryClaimServiceMutations.js');
const { getDomainClaim, listDomainClaims } = require('./domainRegistryClaimServiceQueries.js');

module.exports = {
	createDomainClaim,
	deleteDomainClaim,
	getDomainClaim,
	listDomainClaims
};
