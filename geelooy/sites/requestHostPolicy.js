//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteRequestHostPolicy
 * @description
 * The Awtsmoos distinguishes His own platform doorway from a tenant doorway before
 * paths gain meaning. Awtsmoos.com grants implicit platform trust only to its own
 * namespace and loopback development; every other name or IP must prove tenancy.
 */

const net = require('net');
const { isReservedAwtsmoosHostname } = require('../api/social/helper/drive/domainHostnamePolicy.js');

function canonicalRequestHost(value) {
	const raw = String(value || '').trim().toLowerCase();
	if (!raw) return '';
	if (/[\s/?#@]/.test(raw)) return null;
	if (raw.startsWith('[')) return bracketedHost(raw);
	const host = raw.replace(/:\d+$/, '').replace(/\.$/, '');
	if (!host || host.includes(':') && !net.isIP(host)) return null;
	return host;
}

function isPlatformRequestHost(value, additionalHosts = []) {
	const host = canonicalRequestHost(value);
	if (host === null) return false;
	if (!host || isLoopbackHost(host)) return true;
	if (isReservedAwtsmoosHostname(host)) return true;
	return normalizedAdditionalHosts(additionalHosts).has(host);
}

function isLoopbackHost(host) {
	if (host === 'localhost' || host.endsWith('.localhost')) return true;
	if (host === '::1') return true;
	return /^127(?:\.\d{1,3}){3}$/.test(host);
}

function bracketedHost(raw) {
	const closing = raw.indexOf(']');
	if (closing < 0) return null;
	const address = raw.slice(1, closing);
	const suffix = raw.slice(closing + 1);
	if (net.isIP(address) !== 6) return null;
	if (suffix && !/^:\d+$/.test(suffix)) return null;
	return address;
}

function normalizedAdditionalHosts(values) {
	const list = Array.isArray(values) ? values : String(values || '').split(',');
	return new Set(list.map(canonicalRequestHost).filter(Boolean));
}

module.exports = {
	canonicalRequestHost,
	isPlatformRequestHost,
	isLoopbackHost
};
