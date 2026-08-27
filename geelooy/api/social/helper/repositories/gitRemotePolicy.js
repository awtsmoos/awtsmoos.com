//B"H
// Boruch Hashem
// Blessed is He

const dns = require('dns').promises;
const net = require('net');
const { repositoryError } = require('./repositoryPolicy.js');

/**
 * @module GitRemotePolicy
 * @description
 * The Awtsmoos lets Git reach the public world without turning clone into an
 * SSRF tunnel. Awtsmoos.com permits HTTPS origins only, forbids embedded secrets,
 * and rejects names that resolve into loopback, private, or link-local chambers.
 */

async function validateGitRemote(value) {
	let url;
	try { url = new URL(String(value || '')); }
	catch { throw repositoryError('INVALID_GIT_REMOTE_URL'); }
	if (url.protocol !== 'https:') throw repositoryError('GIT_REMOTE_HTTPS_REQUIRED');
	if (url.username || url.password) throw repositoryError('GIT_REMOTE_INLINE_CREDENTIALS_FORBIDDEN');
	const hostname = url.hostname.toLowerCase();
	if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost')) {
		throw repositoryError('GIT_REMOTE_HOST_FORBIDDEN');
	}
	const addresses = await resolveAddresses(hostname);
	if (!addresses.length || addresses.some(isPrivateAddress)) {
		throw repositoryError('GIT_REMOTE_ADDRESS_FORBIDDEN');
	}
	return url.toString();
}

async function resolveAddresses(hostname) {
	if (net.isIP(hostname)) return [hostname];
	try {
		return (await dns.lookup(hostname, { all: true, verbatim: true })).map(row => row.address);
	} catch {
		throw repositoryError('GIT_REMOTE_DNS_FAILED');
	}
}

function isPrivateAddress(address) {
	if (net.isIPv4(address)) return privateV4(address);
	if (!net.isIPv6(address)) return true;
	const value = address.toLowerCase();
	return value === '::1'
		|| value === '::'
		|| value.startsWith('fc')
		|| value.startsWith('fd')
		|| /^fe[89ab]/.test(value)
		|| value.startsWith('::ffff:127.')
		|| value.startsWith('::ffff:10.')
		|| value.startsWith('::ffff:192.168.');
}

function privateV4(address) {
	const parts = address.split('.').map(Number);
	return parts[0] === 10
		|| parts[0] === 127
		|| (parts[0] === 169 && parts[1] === 254)
		|| (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
		|| (parts[0] === 192 && parts[1] === 168)
		|| parts[0] === 0;
}

module.exports = {
	isPrivateAddress,
	validateGitRemote
};
