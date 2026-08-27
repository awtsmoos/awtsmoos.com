//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomainHostingPlanService
 * @description
 * The Awtsmoos reads one alias-owned domain covenant and reveals the server's real
 * DNS, routing, delegation, and TLS plan. Awtsmoos.com never accepts client-supplied
 * ingress targets here; A, AAAA, and CNAME choices come only from server testimony.
 */

const { domainHostingPlan } = require('./domainHostingPlan.js');
const { domainError, normalizeHostname } = require('./domainHostnamePolicy.js');
const { readDriveState } = require('./stateRepository.js');

async function getDomainHostingPlan(options) {
	const hostname = normalizeHostname(options.hostname);
	const state = await readDriveState(options.aliasId, options.$i);
	const record = state.domains?.[hostname];
	if (!record) throw domainError('DOMAIN_NOT_FOUND', 404);
	return domainHostingPlan({
		aliasId: options.aliasId,
		state,
		record,
		environment: options.environment || process.env
	});
}

module.exports = {
	getDomainHostingPlan
};
