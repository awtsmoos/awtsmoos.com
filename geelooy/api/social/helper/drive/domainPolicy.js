//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainPolicy
 * @description
 * The Awtsmoos binds a proven DNS vessel to one site identity while Awtsmoos.com
 * keeps ownership, delegation, routing, and TLS as separate truthful states.
 */

const { normalizeSiteId } = require('./siteMappingPolicy.js');
const {
	domainError,
	normalizeDnsHostname,
	normalizeHostname
} = require('./domainHostnamePolicy.js');

const DOMAIN_MODES = Object.freeze([
	'external-dns',
	'custom-nameservers',
	'awtsmoos-nameservers'
]);
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{24,128}$/;

function normalizeDomainRecord(hostname, input = {}, previous = {}, now = Date.now()) {
	const mode = normalizeMode(valueFor(input, previous, 'mode', 'external-dns'));
	const modeChanged = Boolean(previous.mode) && previous.mode !== mode;
	return {
		hostname: normalizeHostname(hostname),
		siteId: normalizeSiteId(valueFor(input, previous, 'siteId', 'home')),
		mode,
		nameservers: normalizeNameservers(valueFor(input, previous, 'nameservers', []), mode),
		verificationToken: normalizeToken(valueFor(input, previous, 'verificationToken', '')),
		ownershipState: stateFor(previous.ownershipState, 'pending'),
		delegationState: delegationState(previous, mode, modeChanged),
		routeState: stateFor(previous.routeState, 'inactive'),
		tlsState: stateFor(previous.tlsState, 'inactive'),
		createdAt: timestamp(previous.createdAt, now),
		updatedAt: now,
		verifiedAt: nullableTimestamp(previous.verifiedAt),
		delegationVerifiedAt: modeChanged ? null : nullableTimestamp(previous.delegationVerifiedAt)
	};
}

function normalizeDomainRegistry(value) {
	const source = objectOrEmpty(value);
	const domains = {};
	for (const [hostname, record] of Object.entries(source)) {
		try {
			const normalized = normalizeDomainRecord(hostname, record, record, record.updatedAt);
			domains[normalized.hostname] = normalized;
		} catch {}
	}
	return domains;
}

function normalizeNameservers(value, mode) {
	if (mode !== 'custom-nameservers') return [];
	const source = Array.isArray(value) ? value : [];
	const nameservers = [...new Set(source.map(name => normalizeDnsHostname(name)))];
	if (nameservers.length < 2 || nameservers.length > 8) {
		throw domainError('INVALID_CUSTOM_NAMESERVERS', 400);
	}
	return nameservers;
}

function normalizeMode(value) {
	const mode = String(value || '').trim().toLowerCase();
	if (!DOMAIN_MODES.includes(mode)) throw domainError('INVALID_DOMAIN_MODE', 400);
	if (mode === 'awtsmoos-nameservers') {
		throw domainError('AWTSMOOS_NAMESERVERS_UNAVAILABLE', 409);
	}
	return mode;
}

function normalizeToken(value) {
	const token = String(value || '');
	if (!TOKEN_PATTERN.test(token)) throw domainError('INVALID_DOMAIN_TOKEN', 400);
	return token;
}

function delegationState(previous, mode, modeChanged) {
	if (mode !== 'custom-nameservers') return 'not-required';
	if (modeChanged) return 'pending';
	return stateFor(previous.delegationState, 'pending');
}

function valueFor(input, previous, key, fallback) {
	if (input[key] !== undefined) return input[key];
	if (previous[key] !== undefined) return previous[key];
	return fallback;
}

function stateFor(value, fallback) {
	return typeof value === 'string' && value ? value : fallback;
}

function timestamp(value, fallback) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 0 ? number : fallback;
}

function nullableTimestamp(value) {
	return value === null || value === undefined ? null : timestamp(value, null);
}

function objectOrEmpty(value) {
	return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

module.exports = {
	DOMAIN_MODES,
	normalizeDomainRecord,
	normalizeDomainRegistry
};
