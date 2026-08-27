//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainActivationService
 * @description
 * The Awtsmoos lets verified DNS become HTTP authority only when the running
 * infrastructure also bears witness. Awtsmoos.com can therefore prove ownership
 * today, activate routing tomorrow, and withdraw routing without erasing the claim.
 */

const { domainInfrastructure } = require('./domainInfrastructure.js');
const { normalizeHostname, domainError } = require('./domainHostnamePolicy.js');
const { domainClaimView } = require('./domainView.js');
const { siteMappingsFromState } = require('./siteMappingService.js');
const { mutateDriveState } = require('./stateRepository.js');

async function activateDomainRoute(options) {
	const infrastructure = domainInfrastructure(options.$i, options.environment);
	if (!infrastructure.httpIngressReady) {
		throw domainError('DOMAIN_HTTP_INGRESS_UNAVAILABLE', 503);
	}
	return updateRouteState(options, 'active', infrastructure);
}

async function deactivateDomainRoute(options) {
	const infrastructure = domainInfrastructure(options.$i, options.environment);
	return updateRouteState(options, 'inactive', infrastructure);
}

async function updateRouteState(options, routeState, infrastructure) {
	const hostname = normalizeHostname(options.hostname);
	const now = options.now ?? Date.now();
	const record = await mutateDriveState(options.aliasId, options.$i, state => {
		const claim = state.domains?.[hostname];
		if (!claim) throw domainError('DOMAIN_NOT_FOUND', 404);
		if (routeState === 'active') assertActivationWitnesses(state, claim);
		claim.routeState = routeState;
		if (routeState === 'inactive') claim.tlsState = 'inactive';
		claim.updatedAt = now;
		return claim;
	});
	return {
		domain: domainClaimView(options.aliasId, record),
		infrastructure
	};
}

function assertActivationWitnesses(state, claim) {
	if (claim.ownershipState !== 'verified') {
		throw domainError('DOMAIN_OWNERSHIP_NOT_VERIFIED', 409);
	}
	if (claim.mode === 'custom-nameservers' && claim.delegationState !== 'verified') {
		throw domainError('DOMAIN_DELEGATION_NOT_VERIFIED', 409);
	}
	const site = siteMappingsFromState(state).find(candidate => candidate.id === claim.siteId);
	if (!site || !site.enabled) throw domainError('DOMAIN_SITE_NOT_PUBLISHABLE', 409);
}

module.exports = {
	activateDomainRoute,
	deactivateDomainRoute,
	assertActivationWitnesses
};
