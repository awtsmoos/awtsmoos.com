//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainApi
 * @description
 * The Awtsmoos gives the Drive UI small domain verbs while Awtsmoos.com keeps all
 * DNS targets, verification tokens, routing evidence, and TLS truth on the server.
 * The client chooses intent only; it never manufactures infrastructure testimony.
 */

import { aliasSegment, request } from './apiTransport.js';

export function listDomains() {
	return request(`/drive/${aliasSegment()}/domains`);
}

export function getDomainInfrastructure() {
	return request(`/drive/${aliasSegment()}/hosting/infrastructure`);
}

export function getDomainClaim(hostname) {
	return request(domainRoute(hostname));
}

export function getDomainHostingPlan(hostname) {
	return request(`${domainRoute(hostname)}/hosting-plan`);
}

export function claimDomain(siteId, hostname, values = {}) {
	return request(
		`/drive/${aliasSegment()}/sites/${encodeURIComponent(siteId)}/domains/${hostnameSegment(hostname)}`,
		{
			method: 'PUT',
			body: {
				mode: values.mode || 'external-dns',
				nameservers: values.nameservers || ''
			}
		}
	);
}

export function verifyDomain(hostname) {
	return request(`${domainRoute(hostname)}/verify`, { method: 'PUT' });
}

export function activateDomain(hostname) {
	return request(`${domainRoute(hostname)}/activate`, { method: 'PUT' });
}

export function deactivateDomain(hostname) {
	return request(`${domainRoute(hostname)}/deactivate`, { method: 'PUT' });
}

export function deleteDomain(hostname) {
	return request(domainRoute(hostname), { method: 'DELETE' });
}

function domainRoute(hostname) {
	return `/drive/${aliasSegment()}/domains/${hostnameSegment(hostname)}`;
}

function hostnameSegment(hostname) {
	return encodeURIComponent(String(hostname || '').trim());
}
