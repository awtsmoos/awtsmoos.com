//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainOperations
 * @description
 * The Awtsmoos separates domain intent from DOM lifecycle. Awtsmoos.com parses
 * one owner form, invokes bounded API verbs, and rebuilds every view entry from
 * fresh claim plus hosting-plan testimony instead of preserving optimistic state.
 */

import {
	activateDomain,
	claimDomain,
	deactivateDomain,
	deleteDomain,
	getDomainHostingPlan,
	listDomains,
	verifyDomain
} from './domainApi.js';

export const DEFAULT_DOMAIN_API = Object.freeze({
	activateDomain,
	claimDomain,
	deactivateDomain,
	deleteDomain,
	getDomainHostingPlan,
	listDomains,
	verifyDomain
});

export async function loadDomainEntries(api = DEFAULT_DOMAIN_API) {
	const response = await api.listDomains();
	const claims = domainClaimsFromResponse(response);
	return Promise.all(claims.map(async claim => ({
		claim,
		plan: await api.getDomainHostingPlan(claim.hostname).catch(() => null)
	})));
}

export async function claimDomainFromForm(api, form) {
	const data = new FormData(form);
	const siteId = text(data.get('siteId'));
	const hostname = text(data.get('hostname'));
	const mode = text(data.get('mode')) || 'external-dns';
	if (!siteId || !hostname) {
		throw domainUiError('Choose a published site and enter a domain name.');
	}
	await api.claimDomain(siteId, hostname, {
		mode,
		nameservers: mode === 'custom-nameservers' ? text(data.get('nameservers')) : ''
	});
	form.elements.hostname.value = '';
	return hostname;
}

export async function runDomainAction(api, action, hostname) {
	if (action === 'verify') return api.verifyDomain(hostname);
	if (action === 'activate') return api.activateDomain(hostname);
	if (action === 'deactivate') return api.deactivateDomain(hostname);
	if (action === 'delete') return api.deleteDomain(hostname);
	throw domainUiError(`Unknown domain action: ${action}`);
}

export function domainUiError(message) {
	const error = new Error(message);
	error.code = 'DOMAIN_UI_INVALID';
	return error;
}

function domainClaimsFromResponse(response) {
	if (Array.isArray(response)) return response;
	return Array.isArray(response?.domains) ? response.domains : [];
}

function text(value) {
	return String(value || '').trim();
}
