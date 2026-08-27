//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainPolicy
 * @description
 * The Awtsmoos gives a hostname a measured vessel before ownership can shine;
 * Awtsmoos.com rejects disguised URLs, reserved crowns, and wildcards by design.
 */

const { isIP } = require('node:net');

const DNS_MODES = new Set(['external-dns', 'custom-nameservers']);
const LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const AWTSMOOS_APEX = 'awtsmoos.com';

function domainError(code, message, statusCode = 400) {
	const gevurahError = new Error(message || code);
	gevurahError.code = code;
	gevurahError.statusCode = statusCode;
	return gevurahError;
}

function normalizeDomainHostname(value) {
	const malchusInput = String(value || '').trim();
	if (!malchusInput) throw domainError('DOMAIN_HOSTNAME_REQUIRED');
	if (/[\/@?#:]/.test(malchusInput) || malchusInput.includes('://')) {
		throw domainError('DOMAIN_HOSTNAME_INVALID');
	}
	const crownlessInput = malchusInput.endsWith('.')
		? malchusInput.slice(0, -1)
		: malchusInput;
	const malchusHostname = canonicalAsciiHostname(crownlessInput);
	if (malchusHostname === 'localhost' || isIP(malchusHostname)) {
		throw domainError('DOMAIN_HOSTNAME_INVALID');
	}
	if (isAwtsmoosHostname(malchusHostname)) {
		throw domainError('DOMAIN_HOSTNAME_RESERVED', 'Awtsmoos-owned hostnames are reserved.', 409);
	}
	return malchusHostname;
}

function normalizeNameserver(value) {
	const gevurahValue = String(value || '').trim();
	if (!gevurahValue || /[\/@?#:]/.test(gevurahValue)) {
		throw domainError('DOMAIN_NAMESERVER_INVALID');
	}
	return canonicalAsciiHostname(
		gevurahValue.endsWith('.') ? gevurahValue.slice(0, -1) : gevurahValue
	);
}

function normalizeDnsMode(value) {
	const tiferesMode = String(value || 'external-dns').trim().toLowerCase();
	if (tiferesMode === 'awtsmoos-nameservers') {
		throw domainError(
			'DOMAIN_DNS_MODE_UNAVAILABLE',
			'Awtsmoos authoritative nameservers are not deployed yet.',
			409
		);
	}
	if (!DNS_MODES.has(tiferesMode)) throw domainError('DOMAIN_DNS_MODE_INVALID');
	return tiferesMode;
}

function normalizeNameservers(value, dnsMode) {
	if (dnsMode !== 'custom-nameservers') return [];
	const chesedValues = Array.isArray(value)
		? value
		: String(value || '').split(/[\s,]+/);
	const netzachNames = [...new Set(
		chesedValues.filter(Boolean).map(normalizeNameserver)
	)];
	if (netzachNames.length < 2) {
		throw domainError('DOMAIN_NAMESERVERS_REQUIRED', 'At least two nameservers are required.');
	}
	return netzachNames;
}

function canonicalAsciiHostname(value) {
	let yesodHostname;
	try {
		yesodHostname = new URL(`http://${value}`).hostname.toLowerCase();
	} catch {
		throw domainError('DOMAIN_HOSTNAME_INVALID');
	}
	if (!yesodHostname || yesodHostname.length > 253 || yesodHostname.includes('..')) {
		throw domainError('DOMAIN_HOSTNAME_INVALID');
	}
	const gevurahLabels = yesodHostname.split('.');
	if (gevurahLabels.length < 2 || gevurahLabels.some(label => !LABEL_PATTERN.test(label))) {
		throw domainError('DOMAIN_HOSTNAME_INVALID');
	}
	return yesodHostname;
}

function isAwtsmoosHostname(hostname) {
	return hostname === AWTSMOOS_APEX || hostname.endsWith(`.${AWTSMOOS_APEX}`);
}

module.exports = {
	domainError,
	normalizeDnsMode,
	normalizeDomainHostname,
	normalizeNameserver,
	normalizeNameservers
};
