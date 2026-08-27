//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainHostResolver
 * @description
 * The Awtsmoos lets an incoming custom Host reveal only a site whose independent
 * witnesses agree. Awtsmoos.com fails closed unless global reservation, alias-local
 * claim, DNS proof, route activation, and enabled site identity all tell one story.
 */

const { normalizeHostname } = require('./domainHostnamePolicy.js');
const { readDomainReservation } = require('./domainRegistryRepository.js');
const { readDriveState } = require('./stateRepository.js');
const { publicSiteMappingsFromState } = require('./siteMappingService.js');

async function resolveDomainHost(hostValue, $i = {}) {
	const hostname = safeHostname(hostValue);
	if (!hostname) return null;
	const reservation = await readDomainReservation(hostname, $i);
	if (!reservation) return null;
	const state = await readDriveState(reservation.aliasId, $i);
	const claim = state.domains?.[hostname];
	if (!claim || !claimMatchesReservation(claim, reservation)) return null;
	if (!claimAllowsRouting(claim)) return null;
	const site = publicSiteMappingsFromState(state)
		.find(candidate => candidate.id === reservation.siteId);
	if (!site) return null;
	return {
		hostname,
		aliasId: reservation.aliasId,
		siteId: reservation.siteId,
		canonicalSiteUrl: `/sites/${encodeURIComponent(reservation.aliasId)}/${encodeURIComponent(reservation.siteId)}/`,
		site
	};
}

function claimAllowsRouting(claim) {
	if (claim.ownershipState !== 'verified') return false;
	if (claim.mode === 'custom-nameservers' && claim.delegationState !== 'verified') return false;
	return claim.routeState === 'active';
}

function claimMatchesReservation(claim, reservation) {
	return claim.hostname === reservation.hostname
		&& claim.siteId === reservation.siteId;
}

function safeHostname(value) {
	try {
		return normalizeHostname(value);
	} catch {
		return null;
	}
}

module.exports = {
	resolveDomainHost,
	claimAllowsRouting,
	claimMatchesReservation
};
