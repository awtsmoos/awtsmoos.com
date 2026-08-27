//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomainCompatibilityPolicy
 * @description
 * The Awtsmoos lets an older name and a newer name reveal one measured DNS truth;
 * Awtsmoos.com keeps one canonical policy underneath while signatures cross the bridge without a split roof.
 */

const {
	domainError: createDomainError,
	normalizeDnsHostname,
	normalizeHostname
} = require('./domainHostnamePolicy.js');
const {
	normalizeDomainNameservers
} = require('./domainNameserverPolicy.js');

const DNS_MODES = new Set([
	'external-dns',
	'custom-nameservers'
]);

function domainError(code, messageOrStatus, maybeStatus) {
	const statusCode = Number.isInteger(maybeStatus)
		? maybeStatus
		: messageOrStatus;
	const error = createDomainError(code, statusCode);
	if (typeof messageOrStatus === 'string') {
		error.message = messageOrStatus;
	}
	return error;
}

function normalizeDnsMode(value) {
	const mode = String(value || 'external-dns').trim().toLowerCase();
	if (mode === 'awtsmoos-nameservers') {
		throw domainError(
			'DOMAIN_DNS_MODE_UNAVAILABLE',
			'Awtsmoos nameserver hosting is not available yet.',
			409
		);
	}
	if (!DNS_MODES.has(mode)) {
		throw domainError(
			'DOMAIN_DNS_MODE_INVALID',
			'Choose a supported DNS mode.',
			400
		);
	}
	return mode;
}

function normalizeDomainHostname(value) {
	return normalizeHostname(value);
}

function normalizeNameserver(value) {
	return normalizeDnsHostname(value, 'DOMAIN_NAMESERVER_INVALID');
}

function normalizeNameservers(value, dnsMode) {
	return normalizeDomainNameservers(value, dnsMode);
}

module.exports = {
	domainError,
	normalizeDnsMode,
	normalizeDomainHostname,
	normalizeNameserver,
	normalizeNameservers
};
