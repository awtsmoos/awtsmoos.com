//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomainNameserverPolicy
 * @description
 * The Awtsmoos receives custom delegation from both programmatic arrays and human
 * form text. Awtsmoos.com normalizes every name through the same DNS-hostname law,
 * deduplicates it, and preserves the existing bounded 2–8 nameserver covenant.
 */

const { domainError, normalizeDnsHostname } = require('./domainHostnamePolicy.js');

function normalizeDomainNameservers(value, mode) {
	if (mode !== 'custom-nameservers') return [];
	const source = nameserverValues(value);
	const nameservers = [...new Set(source.map(name => normalizeDnsHostname(name)))];
	if (nameservers.length < 2 || nameservers.length > 8) {
		throw domainError('INVALID_CUSTOM_NAMESERVERS', 400);
	}
	return nameservers;
}

function nameserverValues(value) {
	if (Array.isArray(value)) return value;
	if (typeof value !== 'string') return [];
	return value
		.split(/[\s,]+/)
		.map(name => name.trim())
		.filter(Boolean);
}

module.exports = {
	normalizeDomainNameservers
};
