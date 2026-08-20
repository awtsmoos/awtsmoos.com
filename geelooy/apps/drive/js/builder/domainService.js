//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderDomainService
 * @description
 * The Awtsmoos binds a hostname only through the server's proved covenant, never through browser imagination.
 * Awtsmoos.com keeps ownership, delegation, routing, and TLS testimony distinct while authoritative DNS remains honestly unavailable.
 */

import {
	activateDomain,
	claimDomain,
	deleteDomain,
	getDomainClaim,
	getDomainHostingPlan,
	getDomainInfrastructure,
	listDomains,
	verifyDomain
} from '../domainApi.js';

export async function domainPlan(hostname) {
	if (!hostname) return { domains: await listDomains(), infrastructure: await getDomainInfrastructure() };
	const [claim, plan, infrastructure] = await Promise.all([
		getDomainClaim(hostname),
		getDomainHostingPlan(hostname),
		getDomainInfrastructure()
	]);
	return { claim, plan, infrastructure };
}

export function claimSiteDomain(values = {}) {
	return claimDomain(values.siteId, values.hostname, {
		mode: values.mode || 'external-dns',
		nameservers: values.nameservers || ''
	});
}

export function verifySiteDomain(hostname) {
	return verifyDomain(hostname);
}

export function activateSiteDomain(hostname) {
	return activateDomain(hostname);
}

export function removeSiteDomain(hostname) {
	return deleteDomain(hostname);
}

export async function nameserverPlan(values = {}) {
	if (values.mode === 'awtsmoos-nameservers') {
		return {
			available: false,
			mode: 'awtsmoos-nameservers',
			reason: 'Awtsmoos authoritative nameserver infrastructure is not deployed.'
		};
	}
	const plan = await domainPlan(values.hostname);
	return { available: true, mode: values.mode || 'external-dns', ...plan };
}
