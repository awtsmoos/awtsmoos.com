//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomainRoutingService
 * @description
 * The Awtsmoos turns verified potential into bounded routing actuality. Awtsmoos.com
 * mutates only the claim already stored beneath its alias lock, never accepting a
 * hostname as permission to choose an arbitrary alias, site, or filesystem root.
 */

const { mutateDriveState } = require('./stateRepository.js');
const { normalizeDomainRegistry } = require('./domainPolicy.js');
const { normalizeHostname, domainError } = require('./domainHostnamePolicy.js');
const { assertRouteActivationEligible } = require('./domainRoutingPolicy.js');

async function activateDomainRoute(options) {
	return setDomainRouteState({ ...options, active: true });
}

async function deactivateDomainRoute(options) {
	return setDomainRouteState({ ...options, active: false });
}

async function setDomainRouteState(options) {
	const hostname = normalizeHostname(options.hostname);
	const now = normalizedNow(options.now);
	return mutateDriveState(options.aliasId, options.$i, state => {
		state.domains = normalizeDomainRegistry(state.domains);
		const record = state.domains[hostname];
		if (!record) throw domainError('DOMAIN_NOT_FOUND', 404);
		if (options.active) assertRouteActivationEligible(state, record);
		record.routeState = options.active ? 'active' : 'inactive';
		record.updatedAt = now;
		return routeStateView(record);
	});
}

function routeStateView(record) {
	return {
		hostname: record.hostname,
		siteId: record.siteId,
		mode: record.mode,
		ownershipState: record.ownershipState,
		delegationState: record.delegationState,
		routeState: record.routeState,
		tlsState: record.tlsState,
		updatedAt: record.updatedAt
	};
}

function normalizedNow(value) {
	if (value === undefined) return Date.now();
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0) throw domainError('INVALID_TIMESTAMP', 400);
	return number;
}

module.exports = {
	activateDomainRoute,
	deactivateDomainRoute,
	setDomainRouteState
};
