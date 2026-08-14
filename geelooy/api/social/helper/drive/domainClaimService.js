//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainClaimService
 * @description
 * The Awtsmoos joins a globally unique hostname to an alias-owned site without
 * letting DNS become filesystem authority. Awtsmoos.com reserves first, records the
 * project covenant atomically, verifies public evidence, and fails closed on drift.
 */

const { reservationFor, verificationToken } = require('./domainClaimIdentity.js');
const { normalizeDomainRecord } = require('./domainPolicy.js');
const { normalizeHostname, domainError } = require('./domainHostnamePolicy.js');
const { verifyDomainDns } = require('./domainDnsVerifier.js');
const { domainClaimView } = require('./domainView.js');
const {
	reserveDomainHostname,
	releaseDomainHostname
} = require('./domainRegistryRepository.js');
const { normalizeSiteId } = require('./siteMappingPolicy.js');
const { siteMappingsFromState } = require('./siteMappingService.js');
const { readDriveState, mutateDriveState } = require('./stateRepository.js');

async function listDomainClaims(aliasId, $i) {
	const state = await readDriveState(aliasId, $i);
	return Object.values(state.domains).map(record => domainClaimView(aliasId, record));
}

async function getDomainClaim(aliasId, hostname, $i) {
	return domainClaimView(aliasId, await domainRecord(aliasId, hostname, $i));
}

async function putDomainClaim(options) {
	const hostname = normalizeHostname(options.hostname);
	const siteId = normalizeSiteId(options.siteId);
	const currentState = await readDriveState(options.aliasId, options.$i);
	const existing = currentState.domains[hostname];
	if (existing && existing.siteId !== siteId) throw domainError('DOMAIN_SITE_CONFLICT', 409);
	const token = existing?.verificationToken || verificationToken(options.tokenFactory);
	const now = options.now ?? Date.now();
	const record = normalizeDomainRecord(
		hostname,
		{ ...options.input, siteId, verificationToken: token },
		existing || {},
		now
	);
	const identity = reservationFor(options.aliasId, record, now);
	const reservation = await reserveDomainHostname(identity, options.$i);
	try {
		const saved = await mutateDriveState(options.aliasId, options.$i, state => {
			assertSiteExists(state, siteId);
			state.domains[hostname] = record;
			return record;
		});
		return domainClaimView(options.aliasId, saved);
	} catch (error) {
		if (reservation.created) await releaseDomainHostname(identity, options.$i).catch(() => {});
		throw error;
	}
}

async function verifyDomainClaim(options) {
	const hostname = normalizeHostname(options.hostname);
	const current = await domainRecord(options.aliasId, hostname, options.$i);
	const evidence = await verifyDomainDns(current, options.resolver);
	const now = options.now ?? Date.now();
	const saved = await mutateDriveState(options.aliasId, options.$i, state => {
		const record = state.domains[hostname];
		if (!record) throw domainError('DOMAIN_NOT_FOUND', 404);
		record.ownershipState = evidence.ownershipVerified ? 'verified' : 'pending';
		record.verifiedAt = evidence.ownershipVerified ? now : null;
		record.delegationState = evidence.delegationVerified ? 'verified' : 'pending';
		if (record.mode !== 'custom-nameservers') record.delegationState = 'not-required';
		record.delegationVerifiedAt = evidence.delegationVerified ? now : null;
		record.updatedAt = now;
		return record;
	});
	return { domain: domainClaimView(options.aliasId, saved), evidence };
}

async function deleteDomainClaim(aliasId, hostnameValue, $i) {
	const hostname = normalizeHostname(hostnameValue);
	const removed = await mutateDriveState(aliasId, $i, state => {
		const record = state.domains[hostname];
		if (!record) throw domainError('DOMAIN_NOT_FOUND', 404);
		delete state.domains[hostname];
		return record;
	});
	await releaseDomainHostname({ hostname, aliasId, siteId: removed.siteId }, $i);
	return { deleted: true, hostname };
}

async function domainRecord(aliasId, hostnameValue, $i) {
	const hostname = normalizeHostname(hostnameValue);
	const state = await readDriveState(aliasId, $i);
	if (!state.domains[hostname]) throw domainError('DOMAIN_NOT_FOUND', 404);
	return state.domains[hostname];
}

function assertSiteExists(state, siteId) {
	if (!siteMappingsFromState(state).some(site => site.id === siteId)) {
		throw domainError('SITE_NOT_FOUND', 404);
	}
}

module.exports = {
	listDomainClaims,
	getDomainClaim,
	putDomainClaim,
	verifyDomainClaim,
	deleteDomainClaim
};
