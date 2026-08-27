//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainHostnamePolicy
 * @description
 * The Awtsmoos gives letters a finite DNS garment without confusing the garment
 * for ownership. Awtsmoos.com canonicalizes IDNA names, rejects IP masquerades,
 * and guards its own namespace before any tenant may form a domain claim.
 */

const net = require('net');
const { domainToASCII } = require('url');

function normalizeHostname(value) {
	let hostname = String(value || '').trim().toLowerCase();
	if (!hostname || hostname.includes('://') || /[/?#@]/.test(hostname)) {
		throw domainError('INVALID_DOMAIN_HOSTNAME', 400);
	}
	hostname = hostname.replace(/\.$/, '').replace(/:\d+$/, '');
	const ascii = normalizeDnsHostname(hostname, 'INVALID_DOMAIN_HOSTNAME');
	if (ascii.split('.').length < 2) throw domainError('INVALID_DOMAIN_HOSTNAME', 400);
	if (isReservedAwtsmoosHostname(ascii)) {
		throw domainError('AWTSMOOS_DOMAIN_RESERVED', 403);
	}
	return ascii;
}

function normalizeDnsHostname(value, errorCode = 'INVALID_NAMESERVER_HOSTNAME') {
	const ascii = domainToASCII(String(value || '').trim().toLowerCase().replace(/\.$/, ''));
	if (!ascii || ascii.length > 253 || net.isIP(ascii) || ascii.split('.').some(invalidLabel)) {
		throw domainError(errorCode, 400);
	}
	return ascii.toLowerCase();
}

function isReservedAwtsmoosHostname(hostname) {
	return hostname === 'awtsmoos.com' || hostname.endsWith('.awtsmoos.com');
}

function invalidLabel(label) {
	return !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label);
}

function domainError(code, statusCode = 400) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	normalizeHostname,
	normalizeDnsHostname,
	isReservedAwtsmoosHostname,
	domainError
};
